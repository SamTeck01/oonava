import { requireAny } from "@/lib/admin/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, estimatedValue, monthlyFor } from "@/lib/admin/store";
import { saveDetails, addNote, markWon } from "@/lib/admin/actions";
import { tiers } from "@/lib/content";
import { eur, ago } from "@/lib/admin/format";
import { ScoreBadge, Panel, SampleTag } from "@/components/admin/Badges";
import StatusSelect from "@/components/admin/StatusSelect";
import EmailComposer from "@/components/admin/EmailComposer";
import AssignSelect from "@/components/admin/AssignSelect";
import { can } from "@/lib/admin/team";
import { teamMap } from "@/lib/admin/views";
import { addTask } from "@/lib/admin/work-actions";

export const metadata = { title: "Lead" };

const wa = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, "")}`;

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAny(["sales", "outreach", "marketing"]);
  const { id } = await params;
  const l = await getLead(id);
  if (!l) notFound();
  const team = await teamMap();
  const sales = can(me, "sales");
  const save = saveDetails.bind(null, l.id);
  const note = addNote.bind(null, l.id);
  const won = markWon.bind(null, l.id);
  const label = "mb-1 block text-xs font-semibold text-muted";
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="text-sm text-muted hover:text-fg">← Pipeline</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight">{l.name}<ScoreBadge score={l.score} /><SampleTag show={l.id.startsWith("demo_")} /></h1>
          <p className="mt-1 text-muted">{[l.company, l.industry, l.source, l.created && ago(l.created)].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(sales || can(me, "marketing")) && <AssignSelect id={l.id} value={l.assignedTo} people={team.list.filter((u) => u.active).map((u) => ({ email: u.email, name: u.name }))} />}
          <StatusSelect id={l.id} status={l.status} className="!px-4 !py-2 !text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${l.email}`} className="btn btn-line min-h-11 bg-bg">✉ {l.email}</a>
        {l.phone && <a href={`tel:${l.phone}`} className="btn btn-line min-h-11 bg-bg">📞 Call</a>}
        {l.phone && <a href={wa(l.phone)} target="_blank" rel="noreferrer" className="btn btn-line min-h-11 bg-bg">💬 WhatsApp</a>}
        {sales && <Link href={`/admin/leads/${l.id}/proposal`} className="btn btn-dark min-h-11">📄 Create proposal</Link>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="What they need">
            {l.summary && <p className="font-medium">{l.summary}</p>}
            {l.scoreReason && <p className="mt-2 text-sm text-muted">Why {l.score}: {l.scoreReason}</p>}
            {l.message && <blockquote className="mt-4 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm">{l.message}</blockquote>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span><span className="text-muted">Likely package:</span> <b>{l.tier || "–"}</b></span>
              <span><span className="text-muted">Value:</span> <b>{eur(estimatedValue(l))}</b> + <b>{eur(monthlyFor(l))}</b>/mo</span>
            </div>
          </Panel>

          <EmailComposer id={l.id} name={l.name} unsubscribed={l.status === "Unsubscribed"} />

          {l.replySent && (
            <Panel title="Automatic reply we sent">
              <p className="whitespace-pre-wrap text-sm text-muted">{l.replySent}</p>
            </Panel>
          )}

          <Panel title="Notes">
            <form action={note} className="flex gap-2">
              <input name="note" className={input} placeholder="Add a note, e.g. what they said on the call" />
              <button className="btn btn-dark min-h-11 shrink-0">Add</button>
            </form>
            {l.notes && <p className="mt-4 whitespace-pre-wrap text-sm">{l.notes}</p>}
          </Panel>

          <Panel title="Activity">
            {l.activity ? (
              <ul className="space-y-2 text-sm">{l.activity.split("\n").slice(0, 40).map((a, i) => { const [when, ...rest] = a.split(" · "); return <li key={i} className="flex gap-3"><span className="w-32 shrink-0 text-muted tabular-nums">{when}</span><span>{rest.join(" · ")}</span></li>; })}</ul>
            ) : <p className="text-sm text-muted">No activity yet.</p>}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Task for this lead">
            <form action={addTask} className="space-y-2">
              <input type="hidden" name="lead_id" value={l.id} />
              <input name="title" required placeholder="e.g. Send case study before the call" className={input} />
              <div className="grid grid-cols-2 gap-2">
                <select name="assignee_id" className={input} aria-label="Assign to"><option value="">Me</option>{team.list.filter((u) => u.active && u.id !== me.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                <input name="due_date" type="date" className={input} aria-label="Due date" />
              </div>
              <button className="btn btn-line w-full">Add task</button>
            </form>
          </Panel>

          {sales && l.status !== "Won" && (
            <Panel title="🎉 Mark as won">
              <form action={won} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label><span className={label}>Setup (€)</span><input name="dealValue" inputMode="numeric" defaultValue={estimatedValue(l) || ""} className={input} /></label>
                  <label><span className={label}>Monthly (€)</span><input name="monthlyValue" inputMode="numeric" defaultValue={monthlyFor(l) || ""} className={input} /></label>
                </div>
                <button className="btn w-full bg-[#146c2e] text-white">Mark as won</button>
              </form>
            </Panel>
          )}

          {sales && <Panel title="Details">
            <form action={save} className="space-y-3">
              <label className="block"><span className={label}>Name</span><input name="name" defaultValue={l.name} className={input} /></label>
              <label className="block"><span className={label}>Email</span><input name="email" type="email" defaultValue={l.email} className={input} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className={label}>Company</span><input name="company" defaultValue={l.company} className={input} /></label>
                <label><span className={label}>Phone</span><input name="phone" defaultValue={l.phone} className={input} /></label>
              </div>
              <label className="block"><span className={label}>Industry</span><input name="industry" defaultValue={l.industry} className={input} /></label>
              <label className="block"><span className={label}>Package</span>
                <select name="tier" defaultValue={l.tier} className={input}><option value="">Not decided</option>{tiers.map((t) => <option key={t.name}>{t.name}</option>)}<option>Unclear</option></select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className={label}>Deal setup (€)</span><input name="dealValue" inputMode="numeric" defaultValue={l.dealValue || ""} className={input} /></label>
                <label><span className={label}>Deal monthly (€)</span><input name="monthlyValue" inputMode="numeric" defaultValue={l.monthlyValue || ""} className={input} /></label>
              </div>
              <label className="block"><span className={label}>Next action date</span><input name="nextAction" type="date" defaultValue={l.nextAction?.slice(0, 10)} className={input} /></label>
              <button className="btn btn-dark w-full">Save details</button>
            </form>
          </Panel>}

          <Panel title="Timeline">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Created</dt><dd>{l.created ? new Date(l.created).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "–"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Last contacted</dt><dd>{l.lastContacted ? ago(l.lastContacted) : "–"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Auto follow-ups</dt><dd>{l.followUps} of 3</dd></div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
