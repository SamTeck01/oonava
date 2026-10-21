import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { tasks } from "@/lib/admin/work";
import { teamMap, taskViews } from "@/lib/admin/views";
import { addTask } from "@/lib/admin/work-actions";
import { Panel } from "@/components/admin/Badges";
import TaskList from "@/components/admin/TaskList";

export const metadata = { title: "Tasks" };

export default async function Tasks({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const me = await requireUser();
  const { who } = await searchParams;
  const [all, team] = await Promise.all([tasks.all(), teamMap()]);
  const seeAll = can(me, "admin") || can(me, "delivery");
  const target = seeAll ? (who ?? me.id) : me.id;
  const rows = target === "all" ? all : all.filter((t) => t.assignee_id === target || (target === me.id && t.created_by === me.id && !t.assignee_id));
  const views = await taskViews(rows, me);
  const open = views.filter((t) => !t.done), done = views.filter((t) => t.done).slice(0, 20);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
        {seeAll && (
          <nav className="flex flex-wrap gap-2 text-sm" aria-label="Whose tasks">
            {[{ id: me.id, name: "Mine" }, ...team.list.filter((u) => u.active && u.id !== me.id).map((u) => ({ id: u.id, name: u.name.split(" ")[0] })), { id: "all", name: "Everyone" }].map((x) => (
              <a key={x.id} href={`/admin/tasks?who=${x.id}`} className={`chip min-h-9 ${target === x.id ? "on" : ""}`}>{x.name}</a>
            ))}
          </nav>
        )}
      </div>
      <Panel title="New task">
        <form action={addTask} className="grid gap-2 md:grid-cols-[1fr_180px_160px_auto]">
          <input name="title" required placeholder="What needs doing?" className={input} />
          <select name="assignee_id" className={input} aria-label="Assign to"><option value="">Me</option>{team.list.filter((u) => u.active && u.id !== me.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          <input name="due_date" type="date" className={input} aria-label="Due date" />
          <button className="btn btn-dark min-h-11">Add task</button>
        </form>
      </Panel>
      <Panel title={`Open (${open.length})`}><TaskList tasks={open} showAssignee={target === "all"} empty="Nothing open." /></Panel>
      {done.length > 0 && <Panel title="Recently done"><TaskList tasks={done} showAssignee={target === "all"} /></Panel>}
    </div>
  );
}
