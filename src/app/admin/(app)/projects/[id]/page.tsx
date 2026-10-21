import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { projects, tasks, PROJECT_STAGES } from "@/lib/admin/work";
import { teamMap, taskViews } from "@/lib/admin/views";
import { updateProject, addTask } from "@/lib/admin/work-actions";
import { tiers } from "@/lib/content";
import { eur } from "@/lib/admin/format";
import { Panel, SampleTag } from "@/components/admin/Badges";
import { teamDbEnabled } from "@/lib/admin/db";
import TaskList from "@/components/admin/TaskList";

export const metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  if (!can(me, "delivery") && !can(me, "sales") && !can(me, "finance")) redirect("/admin?denied=1");
  const { id } = await params;
  const p = await projects.get(id);
  if (!p) notFound();
  const [team, ts] = await Promise.all([teamMap(), tasks.where("project_id", id)]);
  const views = await taskViews(ts, me);
  const edit = can(me, "delivery");
  const money = can(me, "finance") || can(me, "sales");
  const save = updateProject.bind(null, id);
  const pct = ts.length ? Math.round((ts.filter((t) => t.done).length / ts.length) * 100) : 0;
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  const label = "mb-1 block text-xs font-semibold text-muted";
  const links = String(p.links || "").split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <Link href="/admin/projects" className="text-sm text-muted hover:text-fg">← Projects</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight">{p.client}<SampleTag show={!teamDbEnabled()} /></h1>
          <p className="text-muted">{p.name} · {p.package || "Custom"} · owner {team.name(p.owner_id)}</p>
        </div>
        <span className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg">{p.stage}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title={`Checklist · ${pct}% done`}>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-accent-strong" style={{ width: `${pct}%` }} /></div>
            <TaskList tasks={views} showAssignee empty="No tasks yet." />
            <form action={addTask} className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_150px_150px_auto]">
              <input type="hidden" name="project_id" value={id} />
              <input name="title" required placeholder="Add a task…" className={input} />
              <select name="assignee_id" className={input} aria-label="Assign to"><option value="">Me</option>{team.list.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
              <input name="due_date" type="date" className={input} aria-label="Due date" />
              <button className="btn btn-dark min-h-11">Add</button>
            </form>
          </Panel>
          {links.length > 0 && (
            <Panel title="Tools & links">
              <ul className="space-y-2 text-sm">{links.map((l, i) => { const m = l.match(/https?:\/\/\S+/); return <li key={i}>{m ? <a href={m[0]} target="_blank" rel="noreferrer" className="text-accent-strong underline-offset-2 hover:underline">{l}</a> : l}</li>; })}</ul>
            </Panel>
          )}
          {p.notes && <Panel title="Notes"><p className="whitespace-pre-wrap text-sm">{String(p.notes)}</p></Panel>}
        </div>

        <Panel title={edit ? "Edit project" : "Details"}>
          <form action={save} className="space-y-3">
            <fieldset disabled={!edit} className="space-y-3">
              <label className="block"><span className={label}>Client</span><input name="client" defaultValue={p.client} className={input} /></label>
              <label className="block"><span className={label}>Project name</span><input name="name" defaultValue={p.name} className={input} /></label>
              <label className="block"><span className={label}>Stage</span><select name="stage" defaultValue={p.stage} className={input}>{PROJECT_STAGES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className="block"><span className={label}>Owner</span><select name="owner_id" defaultValue={p.owner_id ?? ""} className={input}><option value="">Unassigned</option>{team.list.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              <label className="block"><span className={label}>Package</span><select name="package" defaultValue={p.package} className={input}><option value="">–</option>{tiers.map((t) => <option key={t.name}>{t.name}</option>)}<option>Custom</option></select></label>
              <label className="block"><span className={label}>Due date</span><input name="due_date" type="date" defaultValue={(p.due_date as string) ?? ""} className={input} /></label>
              {money ? (
                <div className="grid grid-cols-2 gap-3">
                  <label><span className={label}>Setup (€)</span><input name="setup_fee" inputMode="numeric" defaultValue={Number(p.setup_fee) || ""} className={input} /></label>
                  <label><span className={label}>Monthly (€)</span><input name="monthly_fee" inputMode="numeric" defaultValue={Number(p.monthly_fee) || ""} className={input} /></label>
                </div>
              ) : null}
              <label className="block"><span className={label}>Tools &amp; links (one per line)</span><textarea name="links" rows={4} defaultValue={String(p.links || "")} placeholder={"Airtable: https://…\nMake: https://…\nRepo: https://…"} className="w-full rounded-xl border border-line bg-bg p-3 text-sm" /></label>
              <label className="block"><span className={label}>Notes</span><textarea name="notes" rows={5} defaultValue={String(p.notes || "")} className="w-full rounded-xl border border-line bg-bg p-3 text-sm" /></label>
            </fieldset>
            {edit && <button className="btn btn-dark w-full">Save project</button>}
          </form>
          {money && <p className="mt-4 text-sm text-muted">Value: <b>{eur(Number(p.setup_fee))}</b> + <b>{eur(Number(p.monthly_fee))}</b>/month</p>}
          {p.lead_id && <Link href={`/admin/leads/${p.lead_id}`} className="mt-2 block text-sm text-accent-strong">Original lead →</Link>}
        </Panel>
      </div>
    </div>
  );
}
