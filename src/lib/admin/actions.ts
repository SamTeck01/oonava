"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticate, startSession, endSession, currentUser, demoLoginAllowed, type SessionUser } from "./auth";
import { can, users, findUserByEmail, bootstrapAdmins, hashPassword, type Permission } from "./team";
import { supabaseAuthEnabled, createAuthUser } from "./sbauth";
import { alertTeam } from "@/lib/automation/whatsapp";
import { track } from "./log";
import type { Outcome } from "./constants";
import { getLead, updateLead, createLead, logActivity, type Lead } from "./store";
import { draftEmail, draftProposal, type Purpose } from "./ai";
import { sendEmail, layout } from "@/lib/automation/email";
import { unsubscribeUrl } from "@/lib/automation/token";
import { env } from "@/lib/automation/env";
import { STATUSES, type LeadStatus } from "@/lib/automation/airtable";

// Best-effort login throttle per server instance.
const attempts = new Map<string, number[]>();

export async function login(_: unknown, form: FormData) {
  const now = Date.now();
  const recent = (attempts.get("all") ?? []).filter((t) => now - t < 600_000);
  if (recent.length >= 10) return { error: "Too many attempts. Try again in 10 minutes." };
  const r = await authenticate(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (r.pending) return { error: "Your account is waiting for an admin to approve it." };
  if (r.disabled) return { error: "Your account has been switched off. Contact an admin." };
  if (!r.user) {
    attempts.set("all", [...recent, now]);
    return { error: "Wrong email or password." };
  }
  await startSession(r.user.id);
  redirect("/admin");
}

// Self sign-up: creates a confirmed Supabase Auth user and a pending profile that an admin must approve.
const signups = new Map<string, number[]>();
export async function signup(_: unknown, form: FormData) {
  if (String(form.get("website") ?? "")) return { ok: true }; // honeypot
  const now = Date.now();
  const recent = (signups.get("all") ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= 20) return { error: "Too many sign-ups right now. Try again later." };
  const name = str(form, "name", 120), email = str(form, "email", 200).toLowerCase(), password = String(form.get("password") ?? "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter your name and a valid email." };
  if (password.length < 10) return { error: "Use a password of at least 10 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "Passwords don't match." };
  if (await findUserByEmail(email)) return { error: "An account with that email already exists." };
  signups.set("all", [...recent, now]);

  const admin = bootstrapAdmins().includes(email);
  let id: string;
  if (supabaseAuthEnabled()) {
    const r = await createAuthUser(email, password);
    if (!r.id) return { error: r.error ?? "Could not create the account." };
    id = r.id;
  } else if (demoLoginAllowed()) {
    id = `u_${Math.random().toString(36).slice(2, 10)}`;
  } else return { error: "Sign-up isn't available yet." };

  await users.insert({ id, name, email, title: str(form, "title", 120), permissions: admin ? ["admin"] : [], status: admin ? "active" : "pending", password_hash: supabaseAuthEnabled() ? null : hashPassword(password), last_login: null });
  if (admin) return { ok: "You're the first admin. Sign in now." };
  await alertTeam(`👤 New Oonava account request\n${name} (${email})\nApprove or reject: ${env.siteUrl}/admin/team`);
  return { ok: "Request sent. An admin will approve your account and give you access. You'll be able to sign in once approved." };
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const num = (f: FormData, k: string) => { const n = Number(String(f.get(k) ?? "").replace(/[^\d.]/g, "")); return Number.isFinite(n) ? n : 0; };

async function anyOf(perms: Permission[]): Promise<SessionUser> {
  const u = await currentUser();
  if (!u || !perms.some((p) => can(u, p))) throw new Error("Not allowed");
  return u;
}

const LEAD_TEAM: Permission[] = ["sales", "outreach", "marketing"];

async function mustLead(id: string, perms: Permission[] = LEAD_TEAM) {
  const u = await anyOf(perms);
  const l = await getLead(id);
  if (!l) throw new Error("Lead not found");
  return { l, u };
}

function refresh(id?: string) {
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/admin/leads/${id}`);
}

export async function setStatus(id: string, status: LeadStatus) {
  const { l, u } = await mustLead(id, ["sales", "outreach"]);
  if (!STATUSES.includes(status) || status === l.status) return;
  await updateLead(id, { status });
  await logActivity(l, `${u.name}: stage ${l.status} → ${status}`);
  await track(u, `moved to ${status}:`, l.company || l.name, `/admin/leads/${id}`);
  refresh(id);
}

export async function saveDetails(id: string, form: FormData) {
  const { l, u } = await mustLead(id, ["sales"]);
  const patch: Partial<Lead> = {
    name: str(form, "name", 200) || l.name, email: str(form, "email", 200) || l.email,
    company: str(form, "company", 200), phone: str(form, "phone", 40), industry: str(form, "industry", 100),
    tier: str(form, "tier", 100), nextAction: str(form, "nextAction", 10),
    dealValue: num(form, "dealValue"), monthlyValue: num(form, "monthlyValue"),
  };
  await updateLead(id, patch);
  await logActivity(l, `${u.name}: details updated`);
  refresh(id);
}

export async function addNote(id: string, form: FormData) {
  const { l, u } = await mustLead(id);
  const note = str(form, "note", 4000);
  if (!note) return;
  await updateLead(id, { notes: l.notes ? `${note}\n\n${l.notes}` : note });
  await logActivity(l, `${u.name}: note: ${note.slice(0, 120)}`);
  refresh(id);
}

export async function generateEmail(id: string, purpose: Purpose, extra: string) {
  const { l } = await mustLead(id, ["sales", "outreach"]);
  return draftEmail(l, purpose, extra.slice(0, 1000));
}

export async function sendLeadEmail(id: string, subject: string, body: string, withBooking: boolean) {
  const { l, u } = await mustLead(id, ["sales", "outreach"]);
  if (!subject.trim() || !body.trim()) return { ok: false, error: "Subject and message are required." };
  if (l.status === "Unsubscribed") return { ok: false, error: "This person unsubscribed. Don't email them." };
  const cta = withBooking && env.calendlyUrl ? { label: "Book a free mapping call", url: env.calendlyUrl } : undefined;
  const mail = layout({ name: l.name, body: body.slice(0, 8000), cta, unsubscribeUrl: l.id.startsWith("demo_") ? undefined : unsubscribeUrl(l.id) });
  const ok = l.id.startsWith("demo_") ? true : await sendEmail({ to: l.email, subject: subject.slice(0, 200), ...mail });
  if (!ok) return { ok: false, error: "Email failed to send. Check RESEND_API_KEY and the domain in Resend." };
  const now = new Date().toISOString();
  await updateLead(id, { lastContacted: now, firstContacted: l.firstContacted || now, status: l.status === "New" ? "Contacted" : l.status });
  await logActivity(l, `${u.name}: email sent "${subject.slice(0, 80)}"${l.id.startsWith("demo_") ? " (sample data, not really sent)" : ""}`);
  await track(u, "emailed", l.company || l.name, `/admin/leads/${id}`);
  refresh(id);
  return { ok: true };
}

export async function generateProposal(id: string, tier: string, setup: number, monthly: number, extra: string) {
  const { l } = await mustLead(id, ["sales"]);
  return draftProposal(l, tier, setup, monthly, extra.slice(0, 2000));
}

export async function markProposalSent(id: string, tier: string, setup: number, monthly: number) {
  const { l, u } = await mustLead(id, ["sales"]);
  await updateLead(id, { status: "Proposal", tier, dealValue: setup, monthlyValue: monthly });
  await logActivity(l, `${u.name}: proposal sent: ${tier}, €${setup} + €${monthly}/month`);
  await track(u, "sent a proposal to", l.company || l.name, `/admin/leads/${id}`);
  refresh(id);
}

export async function markWon(id: string, form: FormData) {
  const { l, u } = await mustLead(id, ["sales"]);
  const setup = num(form, "dealValue") || l.dealValue;
  const monthly = num(form, "monthlyValue") || l.monthlyValue;
  await updateLead(id, { status: "Won", dealValue: setup, monthlyValue: monthly });
  await logActivity(l, `${u.name}: won 🎉 €${setup} setup + €${monthly}/month`);
  await track(u, "won 🎉", l.company || l.name, `/admin/leads/${id}`);
  // Start delivery: a project with the standard checklist.
  const { startProjectFromLead } = await import("./work-actions");
  await startProjectFromLead(l, u, setup, monthly);
  refresh(id);
}

export async function newLead(form: FormData) {
  const u = await anyOf(LEAD_TEAM);
  const name = str(form, "name", 200), email = str(form, "email", 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Name and a valid email are required." };
  const id = await createLead({
    name, email, company: str(form, "company", 200), phone: str(form, "phone", 40), industry: str(form, "industry", 100),
    source: str(form, "source", 60) || "Manual", message: str(form, "message", 4000), notes: str(form, "notes", 4000),
    tier: str(form, "tier", 100), status: "New", assignedTo: str(form, "assignedTo", 200),
  });
  if (!id) return { error: "Could not save the lead. Check the Airtable connection and field names." };
  await track(u, "added lead", name, `/admin/leads/${id}`);
  refresh();
  redirect(`/admin/leads/${id}`);
}

// CSV import: header row with name,email and optional company,phone,industry,website,notes,source.
export async function importCsv(csv: string, source: string, assignTo = "") {
  const u = await anyOf(["sales", "outreach", "marketing"]);
  const rows = parseCsv(csv.slice(0, 500_000));
  if (rows.length < 2) return { added: 0, skipped: 0, error: "No rows found. The first line must be the column names." };
  const head = rows[0].map((h) => h.toLowerCase().trim());
  const col = (names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
  const c = { name: col(["name", "contact"]), email: col(["email", "e-mail"]), company: col(["company", "agency", "business"]), phone: col(["phone", "mobile", "tel"]), industry: col(["industry", "sector"]), website: col(["website", "url", "site"]), notes: col(["notes", "note", "comment"]), city: col(["city", "location", "country"]) };
  if (c.email < 0) return { added: 0, skipped: 0, error: "Couldn't find an email column." };
  let added = 0, skipped = 0;
  for (const r of rows.slice(1, 501)) {
    const get = (i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
    const email = get(c.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { skipped++; continue; }
    const notes = [get(c.notes), get(c.website) && `Website: ${get(c.website)}`, get(c.city) && `Location: ${get(c.city)}`].filter(Boolean).join("\n");
    const id = await createLead({ name: get(c.name) || get(c.company) || email, email, company: get(c.company), phone: get(c.phone), industry: get(c.industry), notes, source: source || "Import", status: "New", assignedTo: assignTo });
    if (id) added++; else skipped++;
  }
  if (added) await track(u, `imported ${added} leads from`, source || "CSV", "/admin/leads");
  refresh();
  return { added, skipped };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === "," || ch === ";" || ch === "\t") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export async function assignLead(id: string, email: string) {
  const { l, u } = await mustLead(id, ["sales", "marketing"]);
  await updateLead(id, { assignedTo: email });
  await logActivity(l, `${u.name}: assigned to ${email || "nobody"}`);
  refresh(id);
}

export async function logOutcome(id: string, outcome: Outcome, note: string, callback: string) {
  const { l, u } = await mustLead(id, ["outreach", "sales"]);
  const now = new Date().toISOString();
  const patch: Partial<Lead> = { lastContacted: now, firstContacted: l.firstContacted || now };
  if (outcome === "Call back" && callback) patch.nextAction = callback.slice(0, 10);
  if (outcome === "No answer" || outcome === "Left voicemail") patch.nextAction = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
  if (outcome === "Interested") { patch.status = "Replied"; patch.score = "Hot"; }
  if (outcome === "Booked a call") { patch.status = "Booked"; patch.score = "Hot"; patch.nextAction = callback ? callback.slice(0, 10) : l.nextAction; }
  if (outcome === "Not interested" || outcome === "Wrong contact") { patch.status = "Lost"; patch.nextAction = ""; }
  if (patch.status === undefined && l.status === "New") patch.status = "Contacted";
  await updateLead(id, patch);
  await logActivity(l, `${u.name}: ${outcome}${note ? ` (${note.slice(0, 200)})` : ""}`);
  await track(u, `logged "${outcome}" with`, l.company || l.name, `/admin/leads/${id}`);
  refresh(id);
  revalidatePath("/admin/outreach");
}
