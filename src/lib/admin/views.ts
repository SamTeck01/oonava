import "server-only";
import { allUsers, type PublicUser, publicUser } from "./team";
import { tasks, projects, type Task } from "./work";
import type { SessionUser } from "./auth";
import { can } from "./team";
import type { TaskView } from "@/components/admin/TaskList";

export async function teamMap() {
  const us = await allUsers();
  const map = new Map<string, PublicUser>(us.map((u) => [u.id, publicUser(u)]));
  return { list: us.map(publicUser), name: (id: string | null | undefined) => (id ? map.get(id)?.name ?? "Unknown" : "Unassigned"), byEmail: (e: string) => us.find((u) => u.email === e) };
}

export async function taskViews(rows: Task[], me: SessionUser): Promise<TaskView[]> {
  const [{ name }, ps] = await Promise.all([teamMap(), projects.all()]);
  const pname = new Map(ps.map((p) => [p.id, p.client]));
  return rows
    .map((t) => ({
      id: t.id, title: t.title, done: Boolean(t.done), due: (t.due_date as string) || null, assignee: name(t.assignee_id),
      context: t.project_id ? { label: pname.get(t.project_id) ?? "Project", href: `/admin/projects/${t.project_id}` } : t.lead_id ? { label: "Lead", href: `/admin/leads/${t.lead_id}` } : null,
      canDelete: t.created_by === me.id || can(me, "admin"),
    }))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? "9999").localeCompare(b.due ?? "9999"));
}

export async function myOpenTasks(me: SessionUser) {
  return (await tasks.all()).filter((t) => t.assignee_id === me.id && !t.done);
}
