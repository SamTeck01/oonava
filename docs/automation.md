# Oonava's own automation

Every enquiry from the website is handled automatically:

```
Form / Estimate tool
  → AI analysis (Gemini): summary, industry, likely package, Hot/Warm/Cold, personalised reply
  → Airtable "Leads" record
  → Personalised email reply from hello@oonava.com (within ~1 minute) with the Calendly link
  → WhatsApp alert to the team + copy to hello@oonava.com
  → Follow-ups on day 2, 5 and 10 (daily job at 09:00 UTC) until they book, reply or unsubscribe
  → Calendly booking → lead marked Booked (follow-ups stop) + WhatsApp alert
```

Cold leads (likely spam) get no auto-reply, but the team is still alerted. Every step is optional: if a key is missing, that step is skipped and the rest still runs.

## For Delight: Airtable

Create a base (e.g. **Oonava CRM**) with a table named **Leads**. Field names must match exactly:

| Field | Type |
|---|---|
| Name | Single line text (primary field) |
| Email | Email |
| Company | Single line text |
| Phone | Phone number |
| Message | Long text |
| Source | Single select: Contact form, Estimate tool |
| Summary | Long text |
| Industry | Single line text |
| Recommended Tier | Single select: Essential Automation, Connected Automation + AI, Custom Systems, Unclear |
| Score | Single select: Hot, Warm, Cold |
| Score Reason | Long text |
| Reply Sent | Long text |
| Status | Single select: New, Contacted, Replied, Booked, Proposal, Won, Lost, Unsubscribed |
| Follow-ups Sent | Number (integer) |
| First Contacted | Date (with time) |
| Last Contacted | Date (with time) |
| Notes | Long text (admin dashboard) |
| Activity | Long text (admin dashboard log) |
| Deal Value | Number / currency, € (admin dashboard) |
| Monthly Value | Number / currency, € (admin dashboard) |
| Next Action | Date (admin dashboard) |

Then create a **personal access token** (airtable.com/create/tokens) with scopes `data.records:read` and `data.records:write`, limited to this base. Send the token and the base ID (starts with `app…`, from the base URL) securely; don't use WhatsApp or email in plain text.

**Important:** when someone replies to an email, set their Status to **Replied** in Airtable. That stops the follow-ups. (Auto-detecting replies from the inbox is a later n8n job.)

## For Samad: Vercel environment variables

Set these in Vercel → Project → Settings → Environment Variables (see `.env.example`):

| Variable | Where it comes from |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio |
| `RESEND_API_KEY` | resend.com → add and verify the domain `oonava.com` (DNS records), then create an API key |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | From Delight |
| `WHATSAPP_ALERTS` | Each person who wants alerts follows the WhatsApp setup at callmebot.com on their own phone and gets their own API key. Add everyone as `phone:apikey` pairs separated by commas, e.g. `+447700900123:123456,+2348012345678:654321`. CallMeBot can't post to WhatsApp groups. |
| `NEXT_PUBLIC_CALENDLY_URL` | Your Calendly event link |
| `ADMIN_PASSWORD` | Password for the admin dashboard at oonava.com/admin (at least 8 characters; make it long and share it only via a password manager) |
| `AUTOMATION_SECRET`, `CRON_SECRET` | Any long random strings (e.g. `openssl rand -hex 32`) |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | Calendly webhook subscription (needs a paid Calendly plan); point it to `https://oonava.com/api/webhooks/calendly` for `invitee.created` |

After changing variables, redeploy. The follow-up job is defined in `vercel.json` and runs once a day.

## Limits to know

- **CallMeBot** is free and fine for internal alerts, but it's a third-party hobby service. If alerts become business-critical, move to Twilio or the WhatsApp Business API.
- **Calendly webhooks** need a paid Calendly plan. Without it, mark booked leads as **Booked** in Airtable by hand.
- **Vercel Hobby** runs cron jobs once a day, which is all this needs.

## Admin dashboard (oonava.com/admin)

Password-protected (`ADMIN_PASSWORD`). Until Airtable is connected it shows sample data.

- **Today:** what to do now (reply to new leads, respond to replies, prepare for calls, chase proposals), key numbers and the pipeline.
- **Pipeline:** every lead, searchable and filterable, as a list or board; change the stage from the list.
- **Lead page:** AI summary, call/WhatsApp/email shortcuts, an AI email writer (reply, follow-up, book a call, after the call, cold outreach, win back) that sends from hello@oonava.com, notes, activity log, deal values, next action date, mark as won.
- **Proposals:** AI-written proposal from the chosen package and prices, editable, saved as PDF from the browser; "Mark as sent" moves the lead to the Proposal stage.
- **Add leads:** add one lead or import a CSV (name, email, company, phone, industry, website, city, notes; up to 500 rows).
- **Clients:** won deals, monthly and yearly recurring revenue.
