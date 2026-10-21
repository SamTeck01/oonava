"use client";

import { useTransition } from "react";
import { setStatus } from "@/lib/admin/actions";
import { STATUSES, type LeadStatus } from "@/lib/automation/airtable";
import { STATUS_STYLE } from "@/lib/admin/format";

export default function StatusSelect({ id, status, className = "" }: { id: string; status: string; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Stage"
      value={status}
      disabled={pending}
      onChange={(e) => start(() => setStatus(id, e.target.value as LeadStatus))}
      onClick={(e) => e.stopPropagation()}
      className={`cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-surface"} ${pending ? "opacity-50" : ""} ${className}`}
    >
      {STATUSES.map((s) => <option key={s} value={s} className="bg-bg text-fg">{s}</option>)}
    </select>
  );
}
