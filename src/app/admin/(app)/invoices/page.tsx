import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { redirect } from "next/navigation";
import { invoices, projects } from "@/lib/admin/work";
import { createInvoice } from "@/lib/admin/work-actions";
import { Panel } from "@/components/admin/Badges";
import InvoiceStatus from "@/components/admin/InvoiceStatus";

export const metadata = { title: "Invoices" };

const money = (n: number, c: string) => (c === "GBP" ? "£" : "€") + Math.round(n || 0).toLocaleString("en-GB");

export default async function Invoices() {
  const me = await requireUser();
  if (!can(me, "finance")) redirect("/admin?denied=1");
  const [invs, ps] = await Promise.all([invoices.all(), projects.all()]);
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (i: (typeof invs)[number]) => i.status === "Overdue" || (i.status === "Sent" && !!i.due_date && String(i.due_date) < today);
  const sum = (f: (i: (typeof invs)[number]) => boolean) => invs.filter(f).reduce((s, i) => s + Number(i.amount || 0), 0);
  const month = today.slice(0, 7);
  const stats = [
    ["Paid this month", sum((i) => i.status === "Paid" && String(i.paid_at ?? "").startsWith(month))],
    ["Waiting for payment", sum((i) => i.status === "Sent" && !isOverdue(i))],
    ["Overdue", sum(isOverdue)],
    ["Monthly recurring (live)", ps.filter((p) => p.stage === "Live" || p.stage === "Support").reduce((s, p) => s + Number(p.monthly_fee || 0), 0)],
  ] as const;
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => <div key={k} className="rounded-[20px] border border-line bg-bg p-4"><p className="text-xs text-muted">{k}</p><p className={`mt-2 text-2xl font-semibold tabular-nums ${k === "Overdue" && v > 0 ? "text-[#c8322f]" : ""}`}>€{Math.round(v).toLocaleString("en-GB")}</p></div>)}
      </div>
      <Panel title="All invoices">
        {invs.length === 0 ? <p className="text-sm text-muted">No invoices yet.</p> : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="p-2">Number</th><th className="p-2">Client</th><th className="p-2">Type</th><th className="p-2 text-right">Amount</th><th className="p-2">Due</th><th className="p-2">Status</th></tr></thead>
              <tbody>{invs.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="p-2 font-mono text-xs">{i.number}</td><td className="p-2 font-semibold">{i.client}</td><td className="p-2">{i.kind}</td>
                  <td className="p-2 text-right tabular-nums">{money(Number(i.amount), String(i.currency || "EUR"))}</td>
                  <td className={`p-2 ${isOverdue(i) ? "font-semibold text-[#c8322f]" : "text-muted"}`}>{i.due_date ? new Date(String(i.due_date)).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "–"}</td>
                  <td className="p-2"><InvoiceStatus id={i.id} status={isOverdue(i) && i.status === "Sent" ? "Overdue" : String(i.status)} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel title="New invoice">
        <form action={createInvoice} className="grid gap-3 md:grid-cols-3">
          <input name="client" required placeholder="Client *" className={input} list="clients" />
          <datalist id="clients">{[...new Set(ps.map((p) => p.client))].map((c) => <option key={c} value={c} />)}</datalist>
          <select name="project_id" className={input}><option value="">Project (optional)</option>{ps.map((p) => <option key={p.id} value={p.id}>{p.client} · {p.name}</option>)}</select>
          <select name="kind" className={input}><option>Setup</option><option>Monthly</option><option>Extra</option></select>
          <input name="amount" required inputMode="decimal" placeholder="Amount *" className={input} />
          <select name="currency" className={input}><option value="EUR">EUR €</option><option value="GBP">GBP £</option></select>
          <input name="due_date" type="date" className={input} aria-label="Due date" />
          <input name="notes" placeholder="Notes" className={`${input} md:col-span-2`} />
          <button className="btn btn-dark">Create invoice</button>
        </form>
        <p className="mt-3 text-xs text-muted">This tracks invoices and payments. Send the actual invoice from your accounting tool or a Stripe payment link, then mark it Sent here.</p>
      </Panel>
    </div>
  );
}
