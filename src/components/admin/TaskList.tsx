"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleTask, deleteTask } from "@/lib/admin/work-actions";

export type TaskView = { id: string; title: string; done: boolean; due: string | null; assignee: string; context?: { label: string; href: string } | null; canDelete?: boolean };

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Fixed formatting so server and browser render identical text.
const fmt = (d: string, weekday = false) => { const x = new Date(`${d}T00:00:00Z`); return `${weekday ? `${DAY[x.getUTCDay()]} ` : ""}${x.getUTCDate()} ${MON[x.getUTCMonth()]}`; };

function dueLabel(d: string | null) {
  if (!d) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (d < today) return { text: `Overdue · ${fmt(d)}`, cls: "text-[#c8322f]" };
  if (d === today) return { text: "Today", cls: "text-accent-strong" };
  return { text: fmt(d, true), cls: "text-muted" };
}

function Item({ t, showAssignee }: { t: TaskView; showAssignee: boolean }) {
  const [pending, start] = useTransition();
  const due = dueLabel(t.due);
  return (
    <li className={`flex items-start gap-3 py-3 ${pending ? "opacity-50" : ""}`}>
      <button onClick={() => start(() => toggleTask(t.id))} aria-label={t.done ? "Mark as not done" : "Mark as done"} className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs ${t.done ? "border-[#146c2e] bg-[#146c2e] text-white" : "border-line hover:border-fg"}`}>{t.done ? "✓" : ""}</button>
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${t.done ? "text-muted line-through" : ""}`}>{t.title}</p>
        <p className="flex flex-wrap gap-x-3 text-xs">
          {due && !t.done && <span className={due.cls} suppressHydrationWarning>{due.text}</span>}
          {showAssignee && <span className="text-muted">{t.assignee}</span>}
          {t.context && <Link href={t.context.href} className="text-muted underline-offset-2 hover:underline">{t.context.label}</Link>}
        </p>
      </div>
      {t.canDelete && <button onClick={() => { if (confirm("Delete this task?")) start(() => deleteTask(t.id)); }} className="text-xs text-muted hover:text-[#c8322f]" aria-label="Delete task">✕</button>}
    </li>
  );
}

export default function TaskList({ tasks, showAssignee = false, empty = "Nothing here." }: { tasks: TaskView[]; showAssignee?: boolean; empty?: string }) {
  if (!tasks.length) return <p className="text-sm text-muted">{empty}</p>;
  return <ul className="divide-y divide-line">{tasks.map((t) => <Item key={t.id} t={t} showAssignee={showAssignee} />)}</ul>;
}
