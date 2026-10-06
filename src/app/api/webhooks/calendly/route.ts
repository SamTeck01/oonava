import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/automation/env";
import { findLeads, updateLead, escapeFormula } from "@/lib/automation/airtable";
import { alertTeam } from "@/lib/automation/whatsapp";

function valid(raw: string, header: string | null) {
  if (!env.calendlySigningKey) return process.env.NODE_ENV !== "production"; // unsigned only allowed in dev
  const parts = Object.fromEntries((header ?? "").split(",").map((p) => p.split("=") as [string, string]));
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac("sha256", env.calendlySigningKey).update(`${parts.t}.${raw}`).digest("hex");
  return expected.length === parts.v1.length && timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

// Calendly "invitee.created": mark the lead as Booked (stops follow-ups) and alert the team.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!valid(raw, req.headers.get("calendly-webhook-signature"))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const evt = JSON.parse(raw);
  if (evt.event !== "invitee.created") return NextResponse.json({ ok: true });

  const email: string = evt.payload?.email ?? "";
  const name: string = evt.payload?.name ?? email;
  const start: string = evt.payload?.scheduled_event?.start_time ?? "";
  const leads = email ? await findLeads(`LOWER({Email})='${escapeFormula(email.toLowerCase())}'`) : [];
  await Promise.all(leads.map((l) => updateLead(l.id, { Status: "Booked" })));

  const when = start ? new Date(start).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/London" }) : "unknown time";
  await alertTeam(`📅 Call booked\n${name} (${email})\n${when}\n${leads.length ? `Lead: ${leads[0].fields.Summary ?? ""}` : "Not in CRM yet"}`);
  return NextResponse.json({ ok: true });
}
