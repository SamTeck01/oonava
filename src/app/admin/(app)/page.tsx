import Link from "next/link";
import { listLeads, estimatedValue, monthlyFor, type Lead } from "@/lib/admin/store";
import { eur, ago, OPEN } from "@/lib/admin/format";
import { StatusBadge, ScoreBadge, Panel } from "@/components/admin/Badges";

export const metadata = { title: "Today" };

type Task = { lead: Lead; action: string; why: string; urgent: boolean };

function tasksFor(leads: Lead[]): Task[] {
  const now = Date.now(), day = 86_400_000, today = new Date().toISOString().slice(0, 10);
  const out: Task[] = [];
  for (const l of leads) {
    if (l.status === "New" && l.score !== "Cold") out.push({ lead: l, action: "Reply now", why: `New ${l.score || ""} lead ${ago(l.created)}`.replace("  ", " "), urgent: l.score === "Hot" });
    else if (l.status === "Replied") out.push({ lead: l, action: "Respond", why: "They replied to us", urgent: true });
    else if (l.status === "Booked") out.push({ lead: l, action: "Prepare for call", why: l.nextAction ? `Call on ${new Date(l.nextAction).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}` : "Call booked", urgent: !!l.nextAction && l.nextAction <= today });
    else if (l.status === "Proposal" && (!l.lastContacted || now - Date.parse(l.lastContacted) > 3 * day)) out.push({ lead: l, action: "Chase proposal", why: "Proposal sent 3+ days ago", urgent: false });
    else if (l.nextAction && l.nextAction <= today && OPEN.includes(l.status)) out.push({ lead: l, action: "Follow up", why: "Next action is due", urgent: false });
  }
  return out.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

export default async function Today() {
  const leads = await listLeads();
  const week = Date.now() - 7 * 86_400_000;
  const open = leads.filter((l) => OPEN.includes(l.status));
  const won = leads.filter((l) => l.status === "Won");
  const decided = leads.filter((l) => l.status === "Won" || l.status === "Lost").length;
  const stats = [
    { label: "New leads this week", value: String(leads.filter((l) => Date.parse(l.created) > week).length) },
    { label: "Hot leads open", value: String(open.filter((l) => l.score === "Hot").length) },
    { label: "Open pipeline", value: eur(open.reduce((s, l) => s + estimatedValue(l), 0)), hint: "setup fees" },
    { label: "Monthly recurring", value: eur(won.reduce((s, l) => s + monthlyFor(l), 0)), hint: `${won.length} client${won.length === 1 ? "" : "s"}` },
    { label: "Win rate", value: decided ? `${Math.round((won.length / decided) * 100)}%` : "–", hint: "won vs lost" },
  ];
  const tasks = tasksFor(leads);
  const stages = OPEN.concat("Won").map((s) => { const ls = leads.filter((l) => l.status === s); return { s, n: ls.length, v: ls.reduce((t, l) => t + estimatedValue(l), 0) }; });
  const max = Math.max(1, ...stages.map((x) => x.n));
  const hour = new Date().getHours();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}.</h1>
        </div>
        <Link href="/admin/leads/new" className="btn btn-dark min-h-11">+ Add leads</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[20px] border border-line bg-bg p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{s.value}</p>
            {s.hint && <p className="text-xs text-muted">{s.hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title={`Do this now (${tasks.length})`}>
          {tasks.length === 0 ? <p className="text-muted">You&apos;re all caught up. Add new leads or chase older ones from the pipeline.</p> : (
            <ul className="divide-y divide-line">
              {tasks.slice(0, 12).map((t) => (
                <li key={t.lead.id}>
                  <Link href={`/admin/leads/${t.lead.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.urgent ? "bg-[#c8322f]" : "bg-line"}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">{t.lead.name}<ScoreBadge score={t.lead.score} /></span>
                      <span className="block truncate text-sm text-muted">{t.lead.company ? `${t.lead.company} · ` : ""}{t.why}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-fg px-3 py-1.5 text-xs font-semibold text-bg">{t.action} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Pipeline" action={<Link href="/admin/leads" className="text-sm text-accent-strong">Open →</Link>}>
          <ul className="space-y-3">
            {stages.map((x) => (
              <li key={x.s}>
                <Link href={`/admin/leads?status=${x.s}`} className="block">
                  <div className="flex items-center justify-between text-sm"><StatusBadge status={x.s} /><span className="tabular-nums text-muted">{x.n} · {eur(x.v)}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-accent-strong" style={{ width: `${(x.n / max) * 100}%` }} /></div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Latest leads" action={<Link href="/admin/leads" className="text-sm text-accent-strong">All leads →</Link>}>
        <ul className="divide-y divide-line">
          {leads.slice(0, 6).map((l) => (
            <li key={l.id}>
              <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">{l.name} <ScoreBadge score={l.score} /></span>
                  <span className="block truncate text-sm text-muted">{l.summary || l.message}</span>
                </span>
                <span className="hidden shrink-0 text-right sm:block"><StatusBadge status={l.status} /><span className="block text-xs text-muted">{ago(l.created)}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
