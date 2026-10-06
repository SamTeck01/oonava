import { NextResponse } from "next/server";
import { env } from "@/lib/automation/env";
import { findLeads, updateLead } from "@/lib/automation/airtable";
import { sendEmail, layout } from "@/lib/automation/email";
import { sequence } from "@/lib/automation/followup";
import { unsubscribeUrl } from "@/lib/automation/token";

const DAY = 86_400_000;

// Runs daily (vercel.json). Sends the next follow-up to leads that haven't replied or booked.
export async function GET(req: Request) {
  const prod = process.env.NODE_ENV === "production";
  if ((prod && !env.cronSecret) || (env.cronSecret && req.headers.get("authorization") !== `Bearer ${env.cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await findLeads(`AND({Status}='Contacted', {Follow-ups Sent} < ${sequence.length})`);
  let sent = 0;
  for (const { id, fields } of leads) {
    const n = fields["Follow-ups Sent"] ?? 0;
    const step = sequence[n];
    const first = fields["First Contacted"] ? Date.parse(fields["First Contacted"]) : NaN;
    if (!step || Number.isNaN(first) || Date.now() - first < step.day * DAY) continue;

    const cta = env.calendlyUrl ? { label: "Book a free mapping call", url: env.calendlyUrl } : undefined;
    const mail = layout({ name: fields.Name, body: step.body, cta, unsubscribeUrl: unsubscribeUrl(id) });
    // Claim the step before sending so a retried run can't email twice.
    if (!(await updateLead(id, { "Follow-ups Sent": n + 1, "Last Contacted": new Date().toISOString() }))) continue;
    if (await sendEmail({ to: fields.Email, subject: step.subject, ...mail })) sent++;
  }
  return NextResponse.json({ checked: leads.length, sent });
}
