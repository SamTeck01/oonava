"use client";

import { useTransition } from "react";
import { assignLead } from "@/lib/admin/actions";

export default function AssignSelect({ id, value, people }: { id: string; value: string; people: { email: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">Assigned to</span>
      <select value={value} disabled={pending} onChange={(e) => start(() => assignLead(id, e.target.value))} className={`min-h-9 rounded-full border border-line bg-bg px-3 ${pending ? "opacity-50" : ""}`}>
        <option value="">Nobody</option>
        {people.map((p) => <option key={p.email} value={p.email}>{p.name}</option>)}
      </select>
    </label>
  );
}
