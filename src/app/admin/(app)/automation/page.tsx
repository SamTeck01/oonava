import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { Panel } from "@/components/admin/Badges";
import AutomationButton from "@/components/admin/AutomationButton";
import { env } from "@/lib/automation/env";
import { airtableEnabled } from "@/lib/automation/airtable";
import { outreachStats, inSendWindow, MAX_STEPS, STEP_GAPS_DAYS } from "@/lib/automation/outreach";
import { deliverabilityChecks } from "@/lib/automation/deliverability";
import { mailboxEnabled } from "@/lib/automation/mailbox";

export const metadata = { title: "Automation" };
export const dynamic = "force-dynamic";

const Dot = ({ ok }: { ok: boolean | null }) => <span className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ok === null ? "bg-[#9a9fa5]" : ok ? "bg-[#28c840]" : "bg-[#c8322f]"}`} />;

export default async function Automation() {
  const me = await requireUser();
  if (!can(me, "admin")) redirect("/admin?denied=1");
  const [stats, checks] = await Promise.all([
    airtableEnabled() ? outreachStats().catch(() => null) : null,
    deliverabilityChecks().catch(() => []),
  ]);
  const sources = [
    { name: "Apollo (decision-makers)", on: !!env.apolloKey, detail: `${env.apolloTitles} · ${env.apolloLocations} · ${env.apolloKeywords}`, vars: "APOLLO_API_KEY, APOLLO_TITLES, APOLLO_LOCATIONS, APOLLO_KEYWORDS" },
    { name: "Google Maps (local businesses)", on: !!env.placesKey && !!env.sourcingQueries, detail: env.sourcingQueries || "No searches set", vars: "GOOGLE_PLACES_KEY, SOURCING_QUERIES (e.g. estate agents in Manchester; letting agents in Leeds)" },
  ];
  const stat = (label: string, value: string | number) => (
    <div className="rounded-2xl border border-line bg-bg p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Automation</h1>
        <p className="text-sm text-muted">The sales machine: finds new leads every day, emails them from hello@oonava.com straight away, follows up every 3–4 days, stops the moment someone replies, and watches for spam problems. Admins only.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat("Auto-outreach", env.outreachEnabled ? (inSendWindow() ? "On · sending" : "On · outside hours") : "Off")}
        {stat("Sent today", stats ? `${stats.sentToday} / ${stats.cap}` : "–")}
        {stat("Waiting for first email", stats?.queued ?? "–")}
        {stat("Follow-ups due", stats?.due ?? "–")}
        {stat("Contacted (14 days)", stats?.contacted ?? "–")}
        {stat("Reply rate", stats ? `${stats.replyRate}%` : "–")}
        {stat("Bounce rate", stats ? `${stats.bounceRate}%` : "–")}
        {stat("Unsubscribe rate", stats ? `${stats.unsubRate}%` : "–")}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Panel title="How it runs">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li><b>Find leads:</b> up to {env.sourcingDailyLimit} new prospects a day from the sources below, skipping anyone already in the pipeline.</li>
            <li><b>First email:</b> any new lead (found, imported or added by hand) gets a short, personal AI-written email from hello@oonava.com, in plain text with no links or images so it lands in the inbox, not Promotions.</li>
            <li><b>Follow-ups:</b> {MAX_STEPS - 1} more, {STEP_GAPS_DAYS.join(", ")} days apart, threaded as replies. Then the lead is marked &quot;No response&quot;.</li>
            <li><b>Replies:</b> the inbox is read every run. A reply stops the sequence, marks the lead Replied and alerts the team on Telegram. &quot;No thanks&quot; or &quot;unsubscribe&quot; replies are removed automatically. Bounces are marked and never emailed again.</li>
            <li><b>Safety:</b> Mon–Fri 08:00–17:30 UK only, warm-up limit (starts at 10/day, +5 a day up to {env.outreachDailyCap}), random gaps between emails, spam-word filter, and an automatic pause if bounces go over 5% or unsubscribes over 3%.</li>
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AutomationButton kind="outreach" label="Send now" />
            <AutomationButton kind="sourcing" label="Find new leads now" />
            <AutomationButton kind="inbox" label="Check replies now" />
            <AutomationButton kind="mailbox" label="Test mailbox login" />
          </div>
        </Panel>

        <Panel title="Lead sources">
          <ul className="space-y-4">
            {sources.map((s) => (
              <li key={s.name} className="flex gap-3"><Dot ok={s.on} /><div className="min-w-0"><p className="font-semibold">{s.name}</p><p className="break-words text-sm text-muted">{s.on ? s.detail : `Not connected. Add ${s.vars} in Vercel.`}</p></div></li>
            ))}
            <li className="flex gap-3"><Dot ok={mailboxEnabled()} /><div className="min-w-0"><p className="font-semibold">Mailbox (hello@oonava.com)</p><p className="text-sm text-muted">{mailboxEnabled() ? "Connected for sending and reading replies." : "Add MAIL_PASSWORD in Vercel."}</p></div></li>
          </ul>
          <p className="mt-4 rounded-xl bg-surface p-3 text-xs text-muted">UK rules (PECR/GDPR): cold email is allowed to company addresses when it&apos;s relevant to their business and every email has an easy opt-out, which we add. Avoid sole traders and personal addresses (gmail etc.), and honour every opt-out, which the system does automatically.</p>
        </Panel>
      </div>

      <Panel title="Spam & inbox health">
        <ul className="divide-y divide-line">
          {checks.map((c) => (
            <li key={c.name} className="flex gap-3 py-3"><Dot ok={c.ok} /><div className="min-w-0"><p className="font-semibold">{c.name}</p><p className="break-words text-sm text-muted">{c.detail}</p>{c.fix && <p className="mt-1 text-sm">{c.fix}</p>}</div></li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">Weekly check: send an email from hello@oonava.com to the address shown on <a className="underline" href="https://www.mail-tester.com" target="_blank" rel="noreferrer">mail-tester.com</a>. Aim for 9/10 or higher.</p>
      </Panel>
    </div>
  );
}
