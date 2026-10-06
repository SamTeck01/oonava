// Every integration is optional: missing variables switch that step off instead of failing.
export const env = {
  siteUrl: process.env.SITE_URL ?? "https://oonava.com",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  resendKey: process.env.RESEND_API_KEY,
  mailFrom: process.env.MAIL_FROM ?? "Oonava <hello@oonava.com>",
  teamEmail: process.env.TEAM_EMAIL ?? "hello@oonava.com",
  airtableToken: process.env.AIRTABLE_TOKEN,
  airtableBase: process.env.AIRTABLE_BASE_ID,
  airtableTable: process.env.AIRTABLE_TABLE ?? "Leads",
  whatsappAlerts: process.env.WHATSAPP_ALERTS,
  whatsappPhone: process.env.WHATSAPP_ALERT_PHONE,
  whatsappKey: process.env.CALLMEBOT_API_KEY,
  secret: process.env.AUTOMATION_SECRET ?? "",
  cronSecret: process.env.CRON_SECRET,
  calendlySigningKey: process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
};
