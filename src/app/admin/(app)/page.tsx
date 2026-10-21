import Link from "next/link";
import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { listLeads, estimatedValue, monthlyFor, type Lead } from "@/lib/admin/store";
import { projects, invoices, activity } from "@/lib/admin/work";
import { taskViews, myOpenTasks } from "@/lib/admin/views";
import { eur, ago, OPEN } from "@/lib/admin/format";
import { ScoreBadge, Panel, SampleTag } from "@/components/admin/Badges";
import { teamDbEnabled } from "@/lib/admin/db";
import { getUser } from "@/lib/admin/team";
import TaskList from "@/components/admin/TaskList";

export const metadata = { title: "Today" };

type Action = { lead: Lead; action: string; why: string; urgent: boolean };

function leadActions(leads: Lead[]): Action[] {
  const now = Date.now(), day = 86_400_000, today = new Date().toISOString().slice(0, 10);
  const out: Action[] = [];
  for (const l of leads) {
    if (l.status === "New" && l.score !== "Cold" && l.source !== "Gemini Spark" && l.source !== "Import") out.push({ lead: l, action: "Reply now", why: `New enquiry ${ago(l.created)}`, urgent: l.score === "Hot" });
    else if (l.status === "Replied") out.push({ lead: l, action: "Respond", why: "They replied to us", urgent: true });
    else if (l.status === "Booked") out.push({ lead: l, action: "Prepare for call", why: l.nextAction ? `Call ${new Date(l.nextAction).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}` : "Call booked", urgent: !!l.nextAction && l.nextAction <= today });
    else if (l.status === "Proposal" && (!l.lastContacted || now - Date.parse(l.lastContacted) > 3 * day)) out.push({ lead: l, action: "Chase proposal", why: "Proposal sent 3+ days ago", urgent: false });
    else if (l.nextAction && l.nextAction <= today && OPEN.includes(l.status) && l.status !== "New") out.push({ lead: l, action: "Follow up", why: "Next action is due", urgent: false });
  }
  return out.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

export default async function Today({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const me = await requireUser();
  const { denied } = await searchParams;
  const sales = can(me, "sales"), outreach = can(me, "outreach"), delivery = can(me, "delivery"), finance = can(me, "finance"), admin = can(me, "admin");
  const [leads, myTasks, ps, invs, feed] = await Promise.all([
    sales || outreach || admin ? listLeads() : Promise.resolve([] as Lead[]),
    myOpenTasks(me).then((t) => taskViews(t, me)),
    delivery ? projects.all() : Promise.resolve([]),
    finance ? invoices.all() : Promise.resolve([]),
    activity.all(),
  ]);
  const mine = (l: Lead) => !l.assignedTo || l.assignedTo === me.email || admin;
  const actions = sales ? leadActions(leads.filter(mine)) : [];
  const queue = outreach ? leads.filter((l) => (l.status === "New" || (l.status === "Contacted" && l.nextAction && l.nextAction <= new Date().toISOString().slice(0, 10))) && (l.source === "Gemini Spark" || l.source === "Import" || l.source === "LinkedIn" || l.assignedTo === me.email) && (!l.assignedTo || l.assignedTo === me.email)) : [];
  const myProjects = ps.filter((p) => (p.owner_id === me.id || admin) && p.stage !== "Live" && p.stage !== "Paused");
  const today = new Date().toISOString().slice(0, 10);
  const overdue = invs.filter((i) => i.status === "Overdue" || (i.status === "Sent" && i.due_date && (i.due_date as string) < today));
  const open = leads.filter((l) => OPEN.includes(l.status));
  const won = leads.filter((l) => l.status === "Won");
  const hour = new Date().getHours();
  const profile = await getUser(me.id);

  return (
    <div className="space-y-6">
      {profile && !profile.personal_email && <Link href="/admin/account" className="block rounded-xl bg-[#fff2d6] p-3 text-sm text-[#7a4b00]">Add your <b>personal email</b> under My account so you get approvals, tasks and alerts →</Link>}
      {denied && <p className="rounded-xl bg-[#fff2d6] p-3 text-sm text-[#7a4b00]">You don&apos;t have access to that page. Ask an admin if you need it.</p>}
      <div>
        <p className="text-sm text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, {me.name.split(" ")[0]}.</h1>
      </div>

      {(admin || sales) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["New leads (7 days)", String(leads.filter((l) => Date.parse(l.created) > Date.now() - 7 * 86_400_000).length)],
            ["Open pipeline", eur(open.reduce((s, l) => s + estimatedValue(l), 0))],
            ...(admin || finance ? [["Monthly recurring", eur(won.reduce((s, l) => s + monthlyFor(l), 0))]] : []),
            ["Hot leads open", String(open.filter((l) => l.score === "Hot").length)],
          ].map(([k, v]) => <div key={k} className="rounded-[20px] border border-line bg-bg p-4"><p className="text-xs text-muted">{k}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p></div>)}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title={`My tasks (${myTasks.length})`} action={<Link href="/admin/tasks" className="text-sm text-accent-strong">All tasks →</Link>}>
            <TaskList tasks={myTasks.slice(0, 10)} empty="No open tasks. Nice." />
          </Panel>

          {outreach && (
            <Panel title="Outreach" action={<Link href="/admin/outreach" className="text-sm text-accent-strong">Open desk →</Link>}>
              <p className="text-3xl font-semibold tabular-nums">{queue.length}</p>
              <p className="text-sm text-muted">prospects to contact or call back today</p>
              <Link href="/admin/outreach" className="btn btn-dark mt-4">Start calling →</Link>
            </Panel>
          )}

          {sales && (
            <Panel title={`Leads to act on (${actions.length})`}>
              {actions.length === 0 ? <p className="text-sm text-muted">All caught up.</p> : (
                <ul className="divide-y divide-line">
                  {actions.slice(0, 10).map((t) => (
                    <li key={t.lead.id}>
                      <Link href={`/admin/leads/${t.lead.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.urgent ? "bg-[#c8322f]" : "bg-line"}`} aria-hidden />
                        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 font-semibold">{t.lead.name}<ScoreBadge score={t.lead.score} /><SampleTag show={t.lead.id.startsWith("demo_")} /></span><span className="block truncate text-sm text-muted">{t.lead.company ? `${t.lead.company} · ` : ""}{t.why}</span></span>
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-fg px-3 py-1.5 text-xs font-semibold text-bg">{t.action} →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {delivery && (
            <Panel title={`Projects in progress (${myProjects.length})`} action={<Link href="/admin/projects" className="text-sm text-accent-strong">All projects →</Link>}>
              {myProjects.length === 0 ? <p className="text-sm text-muted">No active projects.</p> : (
                <ul className="divide-y divide-line">{myProjects.map((p) => (
                  <li key={p.id}><Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80"><span><b className="mr-2">{p.client}</b><SampleTag show={!teamDbEnabled()} /><span className="block text-sm text-muted">{p.name}</span></span><span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">{p.stage}</span></Link></li>
                ))}</ul>
              )}
            </Panel>
          )}

          {finance && overdue.length > 0 && (
            <Panel title={`Unpaid & overdue (${overdue.length})`} action={<Link href="/admin/invoices" className="text-sm text-accent-strong">Invoices →</Link>}>
              <ul className="divide-y divide-line">{overdue.map((i) => <li key={i.id} className="flex justify-between py-2 text-sm"><span>{i.client} · {i.number} <SampleTag show={!teamDbEnabled()} /></span><b className="text-[#c8322f]">{eur(Number(i.amount))}</b></li>)}</ul>
            </Panel>
          )}
        </div>

        <Panel title="Team activity">
          {feed.length === 0 ? <p className="text-sm text-muted">Nothing yet.</p> : (
            <ul className="space-y-3 text-sm">
              {feed.slice(0, 15).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold">{String(a.user_name || "?")[0]}</span>
                  <span className="min-w-0"><SampleTag show={!teamDbEnabled()} /> <b>{a.user_name}</b> {a.action} {a.link ? <Link href={String(a.link)} className="font-semibold text-accent-strong">{a.target}</Link> : <b>{a.target}</b>}<span className="block text-xs text-muted">{ago(String(a.created_at))}</span></span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
