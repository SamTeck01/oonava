"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPerm, currentUser, type SessionUser } from "./auth";
import { users, getUser, allUsers, hashPassword, can, type Permission } from "./team";
import { supabaseAuthEnabled, createAuthUser, setAuthPassword, deleteAuthUser } from "./sbauth";
import { projects, tasks, invoices, PROJECT_STAGES, INVOICE_STATUS, DEFAULT_CHECKLIST, type Project, type Invoice } from "./work";
import { track } from "./log";
import type { Lead } from "./store";

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const num = (f: FormData, k: string) => { const n = Number(String(f.get(k) ?? "").replace(/[^\d.]/g, "")); return Number.isFinite(n) ? n : 0; };
const dateOrNull = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const done = (...paths: string[]) => { revalidatePath("/admin", "layout"); paths.forEach((p) => revalidatePath(p)); };

/* ---------- Projects (delivery) ---------- */

export async function startProjectFromLead(l: Lead, u: SessionUser, setup: number, monthly: number) {
  const p = await projects.insert({ name: l.tier || "Automation project", client: l.company || l.name, lead_id: l.id, package: l.tier, stage: "Onboarding", owner_id: null, due_date: null, setup_fee: setup, monthly_fee: monthly, links: "", notes: l.summary });
  for (const t of DEFAULT_CHECKLIST) await tasks.insert({ title: t, details: "", assignee_id: null, due_date: null, done: false, project_id: p.id, lead_id: null, created_by: u.id });
  await track(u, "started project for", p.client, `/admin/projects/${p.id}`);
}

export async function createProject(form: FormData) {
  const u = await assertPerm("delivery");
  const p = await projects.insert({ name: str(form, "name", 200) || "New project", client: str(form, "client", 200), lead_id: null, package: str(form, "package", 100), stage: "Onboarding", owner_id: str(form, "owner_id") || null, due_date: dateOrNull(str(form, "due_date", 10)), setup_fee: num(form, "setup_fee"), monthly_fee: num(form, "monthly_fee"), links: "", notes: str(form, "notes", 4000) });
  if (form.get("checklist")) for (const t of DEFAULT_CHECKLIST) await tasks.insert({ title: t, details: "", assignee_id: p.owner_id, due_date: null, done: false, project_id: p.id, lead_id: null, created_by: u.id });
  await track(u, "created project", p.client, `/admin/projects/${p.id}`);
  done("/admin/projects");
  redirect(`/admin/projects/${p.id}`);
}

export async function updateProject(id: string, form: FormData) {
  const u = await assertPerm("delivery");
  const before = await projects.get(id);
  if (!before) return;
  const stage = str(form, "stage", 30) as Project["stage"];
  await projects.update(id, {
    name: str(form, "name", 200) || before.name, client: str(form, "client", 200) || before.client, package: str(form, "package", 100),
    stage: PROJECT_STAGES.includes(stage) ? stage : before.stage, owner_id: str(form, "owner_id") || null,
    due_date: dateOrNull(str(form, "due_date", 10)), links: str(form, "links", 4000), notes: str(form, "notes", 20000),
    ...(can(u, "finance") || can(u, "sales") ? { setup_fee: num(form, "setup_fee"), monthly_fee: num(form, "monthly_fee") } : {}),
  });
  if (stage !== before.stage) await track(u, `moved project to ${stage}:`, before.client, `/admin/projects/${id}`);
  done(`/admin/projects/${id}`);
}

/* ---------- Tasks (everyone) ---------- */

export async function addTask(form: FormData) {
  const u = await assertPerm();
  const title = str(form, "title", 300);
  if (!title) return;
  await tasks.insert({ title, details: str(form, "details", 4000), assignee_id: str(form, "assignee_id") || u.id, due_date: dateOrNull(str(form, "due_date", 10)), done: false, project_id: str(form, "project_id") || null, lead_id: str(form, "lead_id") || null, created_by: u.id });
  await track(u, "added task", title, "/admin/tasks");
  done("/admin/tasks");
}

export async function toggleTask(id: string) {
  const u = await assertPerm();
  const t = await tasks.get(id);
  if (!t) return;
  // Anyone can tick their own tasks; delivery/admin can tick any.
  if (t.assignee_id !== u.id && !can(u, "delivery") && !can(u, "admin") && t.created_by !== u.id) throw new Error("Not allowed");
  await tasks.update(id, { done: !t.done });
  if (!t.done) await track(u, "completed", t.title, t.project_id ? `/admin/projects/${t.project_id}` : "/admin/tasks");
  done("/admin/tasks", t.project_id ? `/admin/projects/${t.project_id}` : "/admin");
}

export async function deleteTask(id: string) {
  const u = await assertPerm();
  const t = await tasks.get(id);
  if (!t) return;
  if (t.created_by !== u.id && !can(u, "admin")) throw new Error("Not allowed");
  await tasks.remove(id);
  done("/admin/tasks", t.project_id ? `/admin/projects/${t.project_id}` : "/admin");
}

/* ---------- Invoices (finance) ---------- */

async function nextNumber() {
  const year = new Date().getFullYear();
  const all = await invoices.all();
  const n = all.filter((i) => i.number?.startsWith(`OON-${year}-`)).length + 1;
  return `OON-${year}-${String(n).padStart(3, "0")}`;
}

export async function createInvoice(form: FormData) {
  const u = await assertPerm("finance");
  const kind = (["Setup", "Monthly", "Extra"].includes(str(form, "kind")) ? str(form, "kind") : "Setup") as Invoice["kind"];
  const inv = await invoices.insert({ number: await nextNumber(), client: str(form, "client", 200), project_id: str(form, "project_id") || null, kind, amount: num(form, "amount"), currency: str(form, "currency") === "GBP" ? "GBP" : "EUR", due_date: dateOrNull(str(form, "due_date", 10)), status: "Draft", paid_at: null, notes: str(form, "notes", 2000) });
  await track(u, `created invoice ${inv.number} for`, inv.client, "/admin/invoices");
  done("/admin/invoices");
}

export async function setInvoiceStatus(id: string, status: Invoice["status"]) {
  const u = await assertPerm("finance");
  if (!INVOICE_STATUS.includes(status)) return;
  const inv = await invoices.get(id);
  if (!inv) return;
  await invoices.update(id, { status, paid_at: status === "Paid" ? new Date().toISOString() : null });
  await track(u, `marked ${inv.number} ${status.toLowerCase()} for`, inv.client, "/admin/invoices");
  done("/admin/invoices");
}

/* ---------- Team (admin) ---------- */

const PERMS: Permission[] = ["admin", "sales", "outreach", "delivery", "finance", "marketing"];
const permsFrom = (form: FormData) => PERMS.filter((p) => form.get(`perm_${p}`));

async function activeAdmins() {
  return (await allUsers()).filter((x) => x.status === "active" && x.permissions.includes("admin"));
}

export async function approveUser(id: string, form: FormData) {
  const u = await assertPerm("admin");
  const target = await getUser(id);
  if (!target) return;
  const permissions = permsFrom(form);
  await users.update(id, { status: "active", permissions, title: str(form, "title", 120) || target.title });
  await track(u, `approved ${target.name} as ${permissions.join(", ") || "no access"}:`, target.email, "/admin/team");
  done("/admin/team");
}

export async function rejectUser(id: string) {
  const u = await assertPerm("admin");
  const target = await getUser(id);
  if (!target || target.status !== "pending") return;
  if (supabaseAuthEnabled()) await deleteAuthUser(id);
  await users.remove(id);
  await track(u, "rejected the account request from", target.email, "/admin/team");
  done("/admin/team");
}

export async function inviteUser(_: unknown, form: FormData) {
  const u = await assertPerm("admin");
  const email = str(form, "email", 200).toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!str(form, "name") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Name and a valid email are required." };
  if (password.length < 10) return { error: "Temporary password must be at least 10 characters." };
  if ((await users.where("email", email)).length) return { error: "Someone with that email already exists." };
  let id: string | undefined;
  if (supabaseAuthEnabled()) {
    const r = await createAuthUser(email, password);
    if (!r.id) return { error: r.error };
    id = r.id;
  }
  await users.insert({ ...(id ? { id } : {}), name: str(form, "name", 120), email, title: str(form, "title", 120), permissions: permsFrom(form), status: "active", password_hash: supabaseAuthEnabled() ? null : hashPassword(password), last_login: null });
  await track(u, "added team member", str(form, "name", 120), "/admin/team");
  done("/admin/team");
  return { ok: `Added. Send ${email} their temporary password privately and ask them to change it under My account.` };
}

export async function updateUser(id: string, form: FormData) {
  const u = await assertPerm("admin");
  const target = await getUser(id);
  if (!target) return;
  const permissions = permsFrom(form);
  const status = form.get("active") === "on" ? "active" : "disabled";
  const losingAdmin = target.permissions.includes("admin") && (!permissions.includes("admin") || status !== "active");
  if (losingAdmin && (await activeAdmins()).length <= 1) throw new Error("Keep at least one active admin.");
  await users.update(id, { name: str(form, "name", 120) || target.name, title: str(form, "title", 120), permissions, status });
  await track(u, status === "active" ? "updated access for" : "switched off", target.name, "/admin/team");
  done("/admin/team");
}

export async function resetPassword(id: string, form: FormData) {
  const u = await assertPerm("admin");
  const pw = String(form.get("password") ?? "");
  if (pw.length < 10) return;
  if (supabaseAuthEnabled()) { if (!(await setAuthPassword(id, pw))) throw new Error("Could not reset the password."); }
  else await users.update(id, { password_hash: hashPassword(pw) });
  await track(u, "reset the password of", (await getUser(id))?.name ?? "a user", "/admin/team");
  done("/admin/team");
}

export async function changeMyPassword(_: unknown, form: FormData) {
  const u = await currentUser();
  if (!u) return { error: "Not signed in." };
  const pw = String(form.get("password") ?? "");
  if (pw.length < 10) return { error: "Use at least 10 characters." };
  if (pw !== String(form.get("confirm") ?? "")) return { error: "Passwords don't match." };
  if (supabaseAuthEnabled()) { if (!(await setAuthPassword(u.id, pw))) return { error: "Could not change the password. Try again." }; }
  else await users.update(u.id, { password_hash: hashPassword(pw) });
  return { ok: "Password changed." };
}
