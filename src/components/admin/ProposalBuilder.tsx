"use client";

import { useState, useTransition } from "react";
import { generateProposal, markProposalSent } from "@/lib/admin/actions";
import type { Proposal } from "@/lib/admin/ai";

const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("en-GB");

export default function ProposalBuilder({ id, client, tiers, initial }: {
  id: string;
  client: { name: string; company: string; email: string };
  tiers: { name: string; setup: number; monthly: number }[];
  initial: { tier: string; setup: number; monthly: number };
}) {
  const [tier, setTier] = useState(initial.tier);
  const [setup, setSetup] = useState(initial.setup);
  const [monthly, setMonthly] = useState(initial.monthly);
  const [extra, setExtra] = useState("");
  const [p, setP] = useState<Proposal | null>(null);
  const [note, setNote] = useState("");
  const [busy, start] = useTransition();
  const [saving, startSave] = useTransition();

  const pick = (name: string) => { const t = tiers.find((x) => x.name === name)!; setTier(name); setSetup(t.setup); setMonthly(t.monthly); };
  const make = () => start(async () => {
    const r = await generateProposal(id, tier, setup, monthly, extra);
    setP(r);
    setNote(r.aiUsed ? "" : "AI isn't available right now, so this is a template. Edit before sending.");
  });
  const edit = <K extends keyof Proposal>(k: K, v: Proposal[K]) => setP((x) => (x ? { ...x, [k]: v } : x));
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[20px] border border-line bg-bg p-5 md:p-6 print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight">Proposal for {client.company || client.name}</h1>
        <div className="flex flex-wrap gap-2">
          {tiers.map((t) => <button key={t.name} type="button" onClick={() => pick(t.name)} className={`chip text-sm ${tier === t.name ? "on" : ""}`}>{t.name}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className="mb-1 block text-xs font-semibold text-muted">Setup fee (€)</span><input type="number" value={setup} onChange={(e) => setSetup(+e.target.value)} className={input} /></label>
          <label><span className="mb-1 block text-xs font-semibold text-muted">Monthly (€)</span><input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} className={input} /></label>
        </div>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={3} placeholder="Notes from the call: what they need, tools they use, timing… (optional, makes it more specific)" className="w-full rounded-xl border border-line bg-bg p-3" />
        <button type="button" onClick={make} disabled={busy} className="btn btn-accent w-full sm:w-auto">{busy ? "Writing proposal…" : p ? "✨ Rewrite proposal" : "✨ Write proposal"}</button>
        {note && <p className="text-sm text-[#c8322f]">{note}</p>}
      </section>

      {p && (
        <>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => window.print()} className="btn btn-dark">⬇ Save as PDF / print</button>
            <button type="button" disabled={saving} onClick={() => startSave(async () => { await markProposalSent(id, tier, setup, monthly); setNote("Saved: lead moved to Proposal stage."); })} className="btn btn-line bg-bg">{saving ? "Saving…" : "Mark as sent"}</button>
            <p className="w-full text-xs text-muted">Click any text below to edit it before printing. In the print dialog choose &quot;Save as PDF&quot;, then attach it to your email.</p>
          </div>

          <article id="proposal" className="rounded-[20px] bg-bg p-6 text-[15px] leading-relaxed md:p-12 print:rounded-none print:p-0">
            <header className="flex items-start justify-between border-b border-line pb-6">
              <div>
                <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
                <p className="text-sm text-muted">AI automation · integrations · custom systems</p>
              </div>
              <div className="text-right text-sm text-muted"><p>Proposal</p><p>{date}</p></div>
            </header>
            <p className="mt-8 text-sm text-muted">Prepared for {client.name}{client.company ? `, ${client.company}` : ""}</p>
            <h1 contentEditable suppressContentEditableWarning onBlur={(e) => edit("title", e.currentTarget.textContent ?? "")} className="mt-2 text-3xl font-semibold tracking-tight outline-none">{p.title}</h1>
            <p contentEditable suppressContentEditableWarning onBlur={(e) => edit("summary", e.currentTarget.textContent ?? "")} className="mt-4 text-lg outline-none">{p.summary}</p>

            <h2 className="mt-10 text-sm font-bold uppercase tracking-widest text-accent-strong">The challenge</h2>
            <p contentEditable suppressContentEditableWarning onBlur={(e) => edit("challenge", e.currentTarget.textContent ?? "")} className="mt-2 outline-none">{p.challenge}</p>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-accent-strong">Our solution</h2>
            <p contentEditable suppressContentEditableWarning onBlur={(e) => edit("solution", e.currentTarget.textContent ?? "")} className="mt-2 outline-none">{p.solution}</p>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-accent-strong">What you get</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">{p.deliverables.map((d, i) => <li key={i} contentEditable suppressContentEditableWarning className="outline-none">{d}</li>)}</ul>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-accent-strong">Timeline</h2>
            <table className="mt-3 w-full border-collapse text-sm">
              <tbody>{p.timeline.map((t, i) => (
                <tr key={i} className="border-t border-line align-top"><td className="py-2 pr-4 font-semibold" contentEditable suppressContentEditableWarning>{t.phase}</td><td className="whitespace-nowrap py-2 pr-4 text-muted" contentEditable suppressContentEditableWarning>{t.duration}</td><td className="py-2" contentEditable suppressContentEditableWarning>{t.detail}</td></tr>
              ))}</tbody>
            </table>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-accent-strong">Investment</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <div className="rounded-xl bg-surface p-4"><p className="text-sm text-muted">One-off setup</p><p className="text-2xl font-semibold">{eur(setup)}</p></div>
              <div className="rounded-xl bg-surface p-4"><p className="text-sm text-muted">Monthly support &amp; maintenance</p><p className="text-2xl font-semibold">{eur(monthly)}/month</p></div>
            </div>
            <p className="mt-2 text-xs text-muted">Package: {p.packageName}. Prices exclude VAT and third-party subscriptions, which are billed at cost to your own accounts. Valid for 30 days.</p>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-accent-strong">Next steps</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">{p.nextSteps.map((s, i) => <li key={i} contentEditable suppressContentEditableWarning className="outline-none">{s}</li>)}</ol>

            <footer className="mt-12 border-t border-line pt-6 text-sm text-muted">Oonava · hello@oonava.com · oonava.com</footer>
          </article>
        </>
      )}
    </div>
  );
}
