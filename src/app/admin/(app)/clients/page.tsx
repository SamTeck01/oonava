import { requireAny } from "@/lib/admin/auth";
import Link from "next/link";
import { listLeads, estimatedValue, monthlyFor } from "@/lib/admin/store";
import { eur } from "@/lib/admin/format";
import { Panel } from "@/components/admin/Badges";

export const metadata = { title: "Clients" };

export default async function Clients() {
  await requireAny(["sales", "finance"]);
  const clients = (await listLeads()).filter((l) => l.status === "Won");
  const mrr = clients.reduce((s, l) => s + monthlyFor(l), 0);
  const setup = clients.reduce((s, l) => s + estimatedValue(l), 0);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Clients", String(clients.length)], ["Monthly recurring", eur(mrr)], ["Yearly recurring", eur(mrr * 12)], ["Setup fees won", eur(setup)]].map(([k, v]) => (
          <div key={k} className="rounded-[20px] border border-line bg-bg p-4"><p className="text-xs text-muted">{k}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p></div>
        ))}
      </div>
      <Panel title="All clients">
        {clients.length === 0 ? <p className="text-muted">No clients yet. Mark a lead as won to see it here.</p> : (
          <ul className="divide-y divide-line">
            {clients.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/leads/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:opacity-80">
                  <span><b>{c.company || c.name}</b><span className="block text-sm text-muted">{c.name} · {c.tier || "Custom"}</span></span>
                  <span className="text-right tabular-nums"><b>{eur(monthlyFor(c))}</b><span className="text-muted">/mo</span><span className="block text-xs text-muted">{eur(estimatedValue(c))} setup</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
