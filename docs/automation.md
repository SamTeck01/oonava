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
| Status | Single select: New, Contacted, Replied, Booked, Won, Lost, Unsubscribed |
| Follow-ups Sent | Number (integer) |
| First Contacted | Date (with time) |
| Last Contacted | Date (with time) |

Then create a **personal access token** (airtable.com/create/tokens) with scopes `data.records:read` and `data.records:write`, limited to this base. Send the token and the base ID (starts with `app…`, from the base URL) securely; don't use WhatsApp or email in plain text.

**Important:** when someone replies to an email, set their Status to **Replied** in Airtable. That stops the follow-ups. (Auto-detecting replies from the inbox is a later n8n job.)

## For Samad: Vercel environment variables

Set these in Vercel → Project → Settings → Environment Variables (see `.env.example`):

| Variable | Where it comes from |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio |
| `RESEND_API_KEY` | resend.com → add and verify the domain `oonava.com` (DNS records), then create an API key |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | From Delight |
| `WHATSAPP_ALERT_PHONE`, `CALLMEBOT_API_KEY` | Save **+34 644 51 95 23** in your phone, send it the WhatsApp message `I allow callmebot to send me messages`, and it replies with your API key. Each team member who wants alerts does this once (one number per deploy for now). |
| `NEXT_PUBLIC_CALENDLY_URL` | Your Calendly event link |
| `AUTOMATION_SECRET`, `CRON_SECRET` | Any long random strings (e.g. `openssl rand -hex 32`) |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | Calendly webhook subscription (needs a paid Calendly plan); point it to `https://oonava.com/api/webhooks/calendly` for `invitee.created` |

After changing variables, redeploy. The follow-up job is defined in `vercel.json` and runs once a day.

## Limits to know

- **CallMeBot** is free and fine for internal alerts, but it's a third-party hobby service. If alerts become business-critical, move to Twilio or the WhatsApp Business API.
- **Calendly webhooks** need a paid Calendly plan. Without it, mark booked leads as **Booked** in Airtable by hand.
- **Vercel Hobby** runs cron jobs once a day, which is all this needs.
