"use client";

import { useTransition } from "react";
import { setInvoiceStatus } from "@/lib/admin/work-actions";

const S = ["Draft", "Sent", "Paid", "Overdue", "Cancelled"] as const;
const style: Record<string, string> = { Draft: "bg-surface", Sent: "bg-[#e8f1fb] text-[#0b5a9c]", Paid: "bg-[#146c2e] text-white", Overdue: "bg-[#c8322f] text-white", Cancelled: "bg-surface text-muted" };

export default function InvoiceStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select aria-label="Invoice status" value={status} disabled={pending} onChange={(e) => start(() => setInvoiceStatus(id, e.target.value as (typeof S)[number]))} className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${style[status] ?? ""} ${pending ? "opacity-50" : ""}`}>
      {S.map((s) => <option key={s} className="bg-bg text-fg">{s}</option>)}
    </select>
  );
}
