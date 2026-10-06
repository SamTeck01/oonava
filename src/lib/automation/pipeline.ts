import { analyse, type Lead } from "./ai";
import { createLead, updateLead } from "./airtable";
import { sendEmail, layout } from "./email";
import { alertTeam } from "./whatsapp";
import { unsubscribeUrl } from "./token";
import { env } from "./env";

// Enquiry → AI analysis → CRM → personalised reply → team alert.
export async function handleEnquiry(lead: Lead, source: string) {
  const started = Date.now();
  const a = await analyse(lead);

  const id = await createLead({
    Name: lead.name, Email: lead.email, Company: lead.company, Phone: lead.phone,
    Message: [lead.message, lead.context].filter(Boolean).join("\n\n"),
    Source: source, Summary: a.summary, Industry: a.industry, "Recommended Tier": a.tier,
    Score: a.score, "Score Reason": a.reason, Status: "New", "Follow-ups Sent": 0,
  });

  // Don't auto-reply to likely spam; the team still gets the alert.
  let replied = false;
  if (a.score !== "Cold") {
    const cta = env.calendlyUrl ? { label: "Book your free mapping call", url: env.calendlyUrl } : undefined;
    const body = a.reply + (cta ? "" : "\n\nJust reply to this email with a couple of times that suit you and we'll send an invite.");
    const mail = layout({ name: lead.name, body, cta, unsubscribeUrl: id ? unsubscribeUrl(id) : undefined });
    replied = await sendEmail({ to: lead.email, subject: "Thanks for contacting Oonava", ...mail });
    if (id && replied) {
      const now = new Date().toISOString();
      await updateLead(id, { Status: "Contacted", "Reply Sent": mail.text, "First Contacted": now, "Last Contacted": now });
    }
  }

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const alert = [
    `🔔 New Oonava lead (${a.score.toUpperCase()})`,
    `${lead.name}${lead.company ? ` · ${lead.company}` : ""}`,
    lead.email + (lead.phone ? ` · ${lead.phone}` : ""),
    `Industry: ${a.industry}`,
    `Likely: ${a.tier}`,
    `Summary: ${a.summary}`,
    `Why: ${a.reason}`,
    replied ? `✅ Auto-reply sent in ${secs}s` : "⚠️ No auto-reply sent",
  ].join("\n");
  await Promise.all([
    alertTeam(alert),
    sendEmail({ to: env.teamEmail, subject: `New lead (${a.score}): ${lead.name}`, text: `${alert}\n\nMessage:\n${lead.message ?? ""}\n\n${lead.context ?? ""}`, replyTo: lead.email }),
  ]);
}
