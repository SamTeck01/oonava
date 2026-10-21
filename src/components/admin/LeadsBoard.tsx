"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUSES } from "@/lib/automation/airtable";
import { eur, ago } from "@/lib/admin/format";
import { ScoreBadge } from "./Badges";
import StatusSelect from "./StatusSelect";

type Row = { id: string; name: string; company: string; email: string; summary: string; status: string; score: string; tier: string; source: string; created: string; value: number; nextAction: string };

export default function LeadsBoard({ leads, initialStatus }: { leads: Row[]; initialStatus: string }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [score, setScore] = useState("");
  const [view, setView] = useState<"list" | "board">("list");

  const shown = useMemo(() => {
    const t = q.toLowerCase();
    return leads.filter((l) =>
      (!status || l.status === status) && (!score || l.score === score) &&
      (!t || [l.name, l.company, l.email, l.summary, l.source].some((x) => x.toLowerCase().includes(t))));
  }, [leads, q, status, score]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted">{shown.length} of {leads.length} leads · {eur(shown.filter((l) => !["Lost", "Unsubscribed"].includes(l.status)).reduce((s, l) => s + l.value, 0))} in view</p>
        </div>
        <div className="flex gap-2">
          <div className="inline-flex rounded-full border border-line bg-bg p-1 text-sm font-semibold">
            {(["list", "board"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`min-h-9 rounded-full px-4 capitalize ${view === v ? "bg-fg text-bg" : "text-muted"}`}>{v}</button>)}
          </div>
          <Link href="/admin/leads/new" className="btn btn-dark min-h-11">+ Add</Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email…" className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4" aria-label="Search leads" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-full border border-line bg-bg px-4" aria-label="Filter by stage">
          <option value="">All stages</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={score} onChange={(e) => setScore(e.target.value)} className="min-h-11 rounded-full border border-line bg-bg px-4" aria-label="Filter by score">
          <option value="">All scores</option><option>Hot</option><option>Warm</option><option>Cold</option>
        </select>
      </div>

      {view === "list" ? (
        <div className="overflow-hidden rounded-[20px] border border-line bg-bg">
          {shown.length === 0 && <p className="p-6 text-muted">No leads match.</p>}
          <ul className="divide-y divide-line">
            {shown.map((l) => (
              <li key={l.id} className="flex items-center gap-3 p-4 hover:bg-surface/60">
                <Link href={`/admin/leads/${l.id}`} className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">{l.name}<ScoreBadge score={l.score} />{l.company && <span className="font-normal text-muted">· {l.company}</span>}</span>
                  <span className="block truncate text-sm text-muted">{l.summary}</span>
                  <span className="mt-1 block text-xs text-muted" suppressHydrationWarning>{l.source} · {ago(l.created)}{l.tier ? ` · ${l.tier}` : ""}{l.value ? ` · ${eur(l.value)}` : ""}</span>
                </Link>
                <StatusSelect id={l.id} status={l.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div className="grid min-w-[1100px] grid-cols-6 gap-3">
            {["New", "Contacted", "Replied", "Booked", "Proposal", "Won"].map((s) => {
              const col = shown.filter((l) => l.status === s);
              return (
                <div key={s} className="rounded-[16px] bg-bg p-2">
                  <p className="flex justify-between px-2 py-1 text-sm font-semibold">{s}<span className="text-muted">{col.length}</span></p>
                  <p className="px-2 pb-2 text-xs text-muted">{eur(col.reduce((t, l) => t + l.value, 0))}</p>
                  <div className="space-y-2">
                    {col.map((l) => (
                      <Link key={l.id} href={`/admin/leads/${l.id}`} className="block rounded-xl border border-line p-3 hover:border-fg">
                        <span className="flex items-center justify-between gap-2"><b className="truncate text-sm">{l.name}</b><ScoreBadge score={l.score} /></span>
                        <span className="mt-1 line-clamp-2 block text-xs text-muted">{l.company || l.summary}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
