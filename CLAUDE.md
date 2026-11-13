# Oonava — notes for Claude

Oonava is an AI automation and software agency (UK & Europe). This repo holds the marketing site (oonava.com) **and** the internal team dashboard (`/admin`). One Next.js app on Vercel.

## Stack and commands
- Next.js 15 App Router, TypeScript, Tailwind v4. `npm run dev`, `npm run lint`, `npm run build`, `npx tsc --noEmit`.
- Run lint + typecheck + build before every push.
- Deploys: Vercel project `oonava` (team `samteck01s-projects`). Production currently builds from branch `claude/compassionate-feynman-8bga7v`.

## Layout
- `src/app/` — public site pages; content lives in `src/lib/content.ts`. Prices in € with a £ switch (`components/Money`).
- `src/app/api/` — `contact` (enquiry pipeline), `cron/follow-up` (day 2/5/10 follow-ups), `webhooks/calendly`, `unsubscribe`.
- `src/lib/automation/` — `pipeline.ts` (Gemini analysis → Airtable → Resend reply → WhatsApp alert), `airtable.ts`, `email.ts` (branded `layout()`), `whatsapp.ts` (CallMeBot), `env.ts`.
- `src/app/admin/` — login/signup/forgot/reset outside the `(app)` group; dashboard pages inside `(app)/` (today, outreach, leads, projects, tasks, clients, invoices, team, team/emails, account, connections).
- `src/lib/admin/` — `auth.ts` (signed `oonava_admin` cookie), `sbauth.ts` (Supabase Auth REST), `team.ts`, `db.ts` (Supabase → Airtable → in-memory sample), `actions.ts` + `work-actions.ts` (server actions), `notify.ts`, `constants.ts`, `seed.ts` (sample data).
- `docs/` — `automation.md`, `supabase.sql`, `email-templates/` (Supabase auth emails), handoff PDFs.

## Data
- **Leads** live in Airtable base "Oonava CRM" (`appvTakOcM74a9oiH`), table `Leads`. Field names must match `LeadRecord` in `src/lib/automation/airtable.ts`; writes use `typecast: true`.
- **Team, projects, tasks, invoices, activity** live in Supabase project `tsuedznianpjdevyhuzo` (RLS on, no policies; server uses the service-role key).
- Without credentials the app falls back to sample data, tagged SAMPLE in the UI.

## Auth and roles
- People request accounts at `/admin/signup` (work email to log in + personal email for notifications). An admin approves them on `/admin/team` and ticks permissions: admin, sales, outreach, delivery, finance, marketing.
- Core admins: Samad (samad@oonava.com, active), Delight, Kelly. Always keep at least one admin.
- Password reset uses Supabase recovery; templates in `docs/email-templates/`, shown to admins only at `/admin/team/emails`.
- `"use server"` files may only export async functions — put constants in `constants.ts`.

## Rules
- Never put secrets in code, commits or chat. Keys live in Vercel env vars only.
- Never set `ALLOW_DEMO_LOGIN` in production.
- Admin-only pages must check `can(me, "admin")` server-side.
- Avoid locale-dependent date formatting in rendered output (hydration errors); use `src/lib/admin/format.ts`.
- Don't open PRs unless asked.

## Status (Nov 2026)
Done: site, enquiry automation, dashboard, Supabase auth, branded emails, Airtable connected (env vars set, redeployed).
Open:
- End-to-end test of a live enquiry (form → Airtable → reply email → dashboard Leads).
- WhatsApp alerts: CallMeBot is full; `WHATSAPP_ALERTS` not set. Proposed alternative: Telegram bot alerts (not built yet).
- Calendly webhook → `https://oonava.com/api/webhooks/calendly`; confirm the follow-up cron in `vercel.json` runs.
- Hostinger forwarders for work emails so Supabase reset emails arrive.
- Delight and Kelly to sign up and be approved.
- Replace concept case studies with real client work when available.
