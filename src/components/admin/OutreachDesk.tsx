"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { logOutcome } from "@/lib/admin/actions";
import { OUTCOMES, SCRIPTS, type Outcome } from "@/lib/admin/constants";
import EmailComposer from "./EmailComposer";
import { SampleTag } from "./Badges";

type P = { id: string; name: string; company: string; email: string; phone: string; industry: string; notes: string; summary: string; status: string; source: string; nextAction: string; mine: boolean; activity: string[] };

const tone: Record<string, string> = { "Interested": "bg-[#146c2e] text-white", "Booked a call": "bg-[#0b6fc0] text-white", "Not interested": "bg-surface", "Wrong contact": "bg-surface" };

export default function OutreachDesk({ queue, doneToday, me }: { queue: P[]; doneToday: number; me: string }) {
  const [sel, setSel] = useState(queue[0]?.id ?? "");
  const [script, setScript] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const [handled, setHandled] = useState<string[]>([]);
  const list = queue.filter((p) => !handled.includes(p.id));
  const p = list.find((x) => x.id === sel) ?? list[0];

  const log = (o: Outcome) => {
    if (!p) return;
    if ((o === "Call back" || o === "Booked a call") && !date) { setMsg("Pick a date first."); return; }
    start(async () => {
      await logOutcome(p.id, o, note, date);
      setHandled((h) => [...h, p.id]);
      setMsg(`Logged "${o}" for ${p.company || p.name}.`);
      setNote(""); setDate("");
      const next = list.find((x) => x.id !== p.id);
      setSel(next?.id ?? "");
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Outreach</h1>
          <p className="text-sm text-muted">{list.length} to contact · {doneToday + handled.length} done today by {me.split(" ")[0]}</p>
        </div>
        <Link href="/admin/leads/new" className="btn btn-line min-h-11 bg-bg">Import prospects</Link>
      </div>
      {msg && <p className="rounded-xl bg-bg p-3 text-sm">{msg}</p>}

      {!p ? (
        <div className="rounded-[20px] border border-line bg-bg p-8 text-center">
          <p className="text-lg font-semibold">Queue is empty 🎉</p>
          <p className="mt-1 text-sm text-muted">Import new prospects, or check back for scheduled callbacks.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-[20px] border border-line bg-bg p-2">
            {list.map((x) => (
              <li key={x.id}>
                <button onClick={() => { setSel(x.id); setMsg(""); }} className={`w-full rounded-xl px-3 py-2.5 text-left ${x.id === p.id ? "bg-fg text-bg" : "hover:bg-surface"}`}>
                  <span className="flex items-center gap-2"><span className="truncate font-semibold">{x.company || x.name}</span><SampleTag show={x.id.startsWith("demo_")} /></span>
                  <span className={`block truncate text-xs ${x.id === p.id ? "opacity-70" : "text-muted"}`}>{x.status === "New" ? "Not contacted" : `Call back ${x.nextAction}`}{x.mine ? " · yours" : ""}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 space-y-5">
            <section className="rounded-[20px] border border-line bg-bg p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">{p.company || p.name}<SampleTag show={p.id.startsWith("demo_")} /></h2>
                  <p className="text-sm text-muted">{[p.name !== p.company && p.name, p.industry, p.source].filter(Boolean).join(" · ")}</p>
                </div>
                <Link href={`/admin/leads/${p.id}`} className="text-sm text-accent-strong">Full lead →</Link>
              </div>
              {(p.summary || p.notes) && <p className="mt-3 whitespace-pre-wrap text-sm">{p.summary}{p.notes ? `\n${p.notes}` : ""}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.phone && <a href={`tel:${p.phone}`} className="btn btn-dark min-h-11">📞 Call {p.phone}</a>}
                {p.phone && <a href={`https://wa.me/${p.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="btn btn-line min-h-11">💬 WhatsApp</a>}
                {p.email && <a href={`mailto:${p.email}`} className="btn btn-line min-h-11">✉ {p.email}</a>}
              </div>
              {p.activity.length > 0 && p.activity[0] && (
                <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">{p.activity.map((a, i) => <li key={i}>{a}</li>)}</ul>
              )}
            </section>

            <section className="rounded-[20px] border border-line bg-bg p-5 md:p-6">
              <h3 className="font-semibold">Log the outcome</h3>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened? (optional)" className="min-h-11 flex-1 rounded-xl border border-line bg-bg px-3" />
                <label className="flex items-center gap-2 text-sm"><span className="text-muted">Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11 rounded-xl border border-line bg-bg px-3" /></label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {OUTCOMES.map((o) => <button key={o} disabled={pending} onClick={() => log(o)} className={`min-h-11 rounded-full border border-line px-4 text-sm font-semibold hover:border-fg disabled:opacity-50 ${tone[o] ?? "bg-bg"}`}>{o}</button>)}
              </div>
              <p className="mt-2 text-xs text-muted">&quot;Call back&quot; and &quot;Booked a call&quot; need a date. No answer / voicemail schedules a retry in 2 days automatically.</p>
            </section>

            <section className="rounded-[20px] border border-line bg-bg p-5 md:p-6">
              <h3 className="font-semibold">Script</h3>
              <div className="mt-3 flex flex-wrap gap-2">{SCRIPTS.map((s, i) => <button key={s.title} onClick={() => setScript(i)} className={`chip min-h-9 text-sm ${script === i ? "on" : ""}`}>{s.title}</button>)}</div>
              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-relaxed">{SCRIPTS[script].body}</p>
            </section>

            {p.email && <EmailComposer key={p.id} id={p.id} name={p.name} unsubscribed={false} defaultPurpose="outreach" />}
          </div>
        </div>
      )}
    </div>
  );
}
