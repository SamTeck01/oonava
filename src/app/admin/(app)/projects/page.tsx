import Link from "next/link";
import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { redirect } from "next/navigation";
import { projects, tasks, PROJECT_STAGES } from "@/lib/admin/work";
import { teamMap } from "@/lib/admin/views";
import { tiers } from "@/lib/content";
import { createProject } from "@/lib/admin/work-actions";
import { eur } from "@/lib/admin/format";
import { Panel, SampleTag } from "@/components/admin/Badges";
import { teamDbEnabled } from "@/lib/admin/db";

export const metadata = { title: "Projects" };

export default async function Projects() {
  const me = await requireUser();
  if (!can(me, "delivery") && !can(me, "sales") && !can(me, "finance")) redirect("/admin?denied=1");
  const [ps, ts, team] = await Promise.all([projects.all(), tasks.all(), teamMap()]);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted">Client builds and ongoing support. Winning a deal creates its project automatically.</p>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-[1000px] grid-cols-6 gap-3">
          {PROJECT_STAGES.map((s) => {
            const col = ps.filter((p) => p.stage === s);
            return (
              <div key={s} className="rounded-[16px] bg-bg p-2">
                <p className="flex justify-between px-2 py-1 text-sm font-semibold">{s}<span className="text-muted">{col.length}</span></p>
                <div className="mt-1 space-y-2">
                  {col.map((p) => {
                    const pt = ts.filter((t) => t.project_id === p.id);
                    const pct = pt.length ? Math.round((pt.filter((t) => t.done).length / pt.length) * 100) : 0;
                    return (
                      <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-xl border border-line p-3 hover:border-fg">
                        <span className="flex items-center justify-between gap-1"><b className="truncate text-sm">{p.client}</b><SampleTag show={!teamDbEnabled()} /></span>
                        <span className="block truncate text-xs text-muted">{p.name}</span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface"><span className="block h-full bg-accent-strong" style={{ width: `${pct}%` }} /></span>
                        <span className="mt-1 flex justify-between text-[11px] text-muted"><span>{team.name(p.owner_id)}</span><span>{pct}%</span></span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {can(me, "delivery") && (
        <Panel title="New project">
          <form action={createProject} className="grid gap-3 md:grid-cols-3">
            <input name="client" required placeholder="Client *" className={input} />
            <input name="name" placeholder="Project name" className={input} />
            <select name="package" className={input}><option value="">Package</option>{tiers.map((t) => <option key={t.name}>{t.name}</option>)}<option>Custom</option></select>
            <select name="owner_id" className={input}><option value="">Owner</option>{team.list.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            <input name="due_date" type="date" className={input} aria-label="Due date" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="checklist" defaultChecked /> Add standard checklist</label>
            <input name="setup_fee" inputMode="numeric" placeholder="Setup fee (€)" className={input} />
            <input name="monthly_fee" inputMode="numeric" placeholder="Monthly fee (€)" className={input} />
            <button className="btn btn-dark">Create project</button>
          </form>
        </Panel>
      )}
      <p className="text-sm text-muted">Monthly recurring from live projects: <b>{eur(ps.filter((p) => p.stage === "Live" || p.stage === "Support").reduce((s, p) => s + Number(p.monthly_fee || 0), 0))}</b></p>
    </div>
  );
}
