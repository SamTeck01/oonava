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
| Assigned To | Email (admin dashboard: the team member's login email) |

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
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Owner "master key" login for oonava.com/admin (e.g. `samad@oonava.com` + a long password). Works even before any team member exists. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Optional. If set, team data (people, projects, tasks, invoices, activity) is stored in Supabase instead of Airtable. Run `docs/supabase.sql` first. |
| `AUTOMATION_SECRET`, `CRON_SECRET` | Any long random strings (e.g. `openssl rand -hex 32`) |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | Calendly webhook subscription (needs a paid Calendly plan); point it to `https://oonava.com/api/webhooks/calendly` for `invitee.created` |

After changing variables, redeploy. The follow-up job is defined in `vercel.json` and runs once a day.

## Limits to know

- **CallMeBot** is free and fine for internal alerts, but it's a third-party hobby service. If alerts become business-critical, move to Twilio or the WhatsApp Business API.
- **Calendly webhooks** need a paid Calendly plan. Without it, mark booked leads as **Booked** in Airtable by hand.
- **Vercel Hobby** runs cron jobs once a day, which is all this needs.

## Admin dashboard (oonava.com/admin)

A team workspace. Everyone has their own login (e.g. `samad@oonava.com`). These are usernames only, so no mailbox is needed. Admins set and reset passwords on the Team page.

### Access
Each person gets permission switches, changeable any time on **Team**:

| Permission | Gives access to |
|---|---|
| Admin | Everything, including the Team page (core team: Kelly, Samad, Delight) |
| Sales | Leads, pipeline, proposals, mark as won, clients |
| Outreach | Outreach desk: call list, scripts, one-click outcomes, AI emails |
| Delivery | Projects, checklists, tool links |
| Finance | Invoices, payments, revenue numbers |
| Marketing | Lead imports, assigning leads |

Everyone gets **Today** (their own to-do list and team activity), **Tasks** and **My account**.

### Sections
- **Today:** my tasks, leads to act on, outreach queue, my projects, overdue invoices, team activity.
- **Outreach:** prospects to call (imported or assigned), call/WhatsApp/email, scripts, outcomes (No answer, Voicemail, Call back, Interested, Booked a call, Not interested, Wrong contact). Outcomes update the lead, schedule retries and log activity.
- **Pipeline / Lead page:** search, filters, list or board, stage changes, assignment, AI emails, notes, tasks, activity, deal values, mark as won.
- **Proposals:** AI-written, editable, save as PDF, mark as sent.
- **Add leads:** one lead or CSV import (up to 500), with assignment.
- **Projects:** created automatically when a deal is won, with a standard checklist; stage board, owner, due date, tool links, notes.
- **Tasks:** for anyone, linked to a project or lead.
- **Clients:** won deals and recurring revenue.
- **Invoices:** track setup/monthly/extra invoices, Draft → Sent → Paid / Overdue.
- **Team:** add people, switch permissions, deactivate, reset passwords.

### Where team data is stored
1. **Supabase** if `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set (recommended: fast, no record limits). Run `docs/supabase.sql`.
2. Otherwise **Airtable**, in the same base as Leads, in these tables (names exact):

| Table | Fields (exact names and types) |
|---|---|
| **Team** | `name` (single line text, primary), `email` (email), `title` (single line text), `permissions` (multiple select: admin, sales, outreach, delivery, finance, marketing), `password_hash` (long text), `active` (checkbox), `last_login` (date with time) |
| **Projects** | `name` (primary), `client`, `lead_id`, `package`, `stage` (single select: Onboarding, Building, Testing, Live, Support, Paused), `owner_id`, `due_date` (date), `setup_fee` (number), `monthly_fee` (number), `links` (long text), `notes` (long text) |
| **Tasks** | `title` (primary), `details` (long text), `assignee_id`, `due_date` (date), `done` (checkbox), `project_id`, `lead_id`, `created_by` |
| **Invoices** | `number` (primary), `client`, `project_id`, `kind` (single select: Setup, Monthly, Extra), `amount` (number), `currency` (single select: EUR, GBP), `due_date` (date), `status` (single select: Draft, Sent, Paid, Overdue, Cancelled), `paid_at` (date with time), `notes` (long text) |
| **Activity** | `action` (primary), `user_id`, `user_name`, `target`, `link` |

Fields without a type listed are single line text. Note: Airtable's free plan allows 1,000 records per base. The activity log and tasks grow quickly, so move team data to Supabase (free) once you're active.

### First login
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel and redeploy. Sign in, open **Team**, add Kelly, Delight and yourself as Admin, and add others with only what they need. Share temporary passwords privately; each person changes theirs under **My account**.
