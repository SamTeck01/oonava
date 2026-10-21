import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { redirect } from "next/navigation";
import { connections } from "@/lib/admin/connections";
import ConnectionTest from "@/components/admin/ConnectionTest";

export const metadata = { title: "Connections" };

export default async function Connections() {
  const me = await requireUser();
  if (!can(me, "admin")) redirect("/admin?denied=1");
  const list = connections();
  const done = list.filter((c) => c.connected).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-muted">{done} of {list.length} connected. Keys are added in <b>Vercel → Settings → Environment Variables</b> (never here or in chat), then redeploy. Secret values are never shown on this page.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((c) => (
          <section key={c.id} className={`min-w-0 rounded-[20px] border bg-bg p-5 md:p-6 ${c.connected ? "border-line" : "border-[#e0b04a]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{c.name}</h2>
                <p className="text-sm text-muted">{c.does}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${c.connected ? "bg-[#e3f6e8] text-[#146c2e]" : "bg-[#fff2d6] text-[#7a4b00]"}`}>{c.connected ? "✓ Connected" : "Not connected"}</span>
            </div>
            {c.connected && c.detail && <p className="mt-2 truncate text-xs text-muted">{c.detail}</p>}
            {!c.connected && (
              <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">{c.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            )}
            <p className="mt-3 text-xs text-muted">Vercel variables: {c.vars.map((v) => <code key={v} className="mr-1 rounded bg-surface px-1.5 py-0.5">{v}</code>)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!c.connected && <a href={c.connectUrl} target="_blank" rel="noreferrer" className="btn btn-dark min-h-10">Connect: {c.connectLabel} ↗</a>}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="btn btn-line min-h-10">Vercel settings ↗</a>
              {c.testable && c.connected && <ConnectionTest id={c.id as "airtable" | "resend"} />}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
