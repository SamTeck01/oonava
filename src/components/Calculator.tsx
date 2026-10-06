"use client";

import { useState } from "react";
import { Btn } from "./Ui";

const fmt = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-3 flex items-baseline justify-between gap-4">
        <span className="text-muted">{label}</span>
        <span className="h4 tabular-nums">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} aria-label={label} />
    </label>
  );
}

export default function Calculator() {
  const [leads, setLeads] = useState(250);
  const [deal, setDeal] = useState(8000);
  const [reply, setReply] = useState(2);
  const [admin, setAdmin] = useState(30);

  // Illustrative model only: assumes ~1% close rate and a modest uplift from faster replies.
  const uplift = Math.min(0.35, reply * 0.06);
  const extraDeals = leads * 0.01 * uplift;
  const revenue = extraDeals * deal;
  const hours = admin * 4.3 * 0.6;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-9 p-6 md:p-10">
        <Slider label="Monthly enquiries" value={leads} display={String(leads)} min={20} max={1500} step={10} onChange={setLeads} />
        <Slider label="Average deal value" value={deal} display={fmt(deal)} min={1000} max={50000} step={500} onChange={setDeal} />
        <Slider label="Current response time" value={reply} display={reply < 1 ? "Under 1 hour" : `${reply} hours`} min={0} max={24} step={1} onChange={setReply} />
        <Slider label="Admin hours per week" value={admin} display={`${admin} h`} min={0} max={120} step={5} onChange={setAdmin} />
      </div>
      <div className="flex flex-col justify-between rounded-[var(--radius)] bg-fg p-6 text-bg md:p-10">
        <div>
          <p className="opacity-70">Hours your team could get back each month</p>
          <p className="mt-2 text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-none tracking-tight tabular-nums">{Math.round(hours)}h</p>
          <p className="mt-10 opacity-70">Potential extra revenue from faster replies, per month</p>
          <p className="mt-2 text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-none tracking-tight text-accent tabular-nums">{fmt(revenue)}</p>
        </div>
        <div className="mt-10">
          <p className="mb-6 text-sm opacity-60">Illustrative estimate based on simple assumptions, not a guarantee. We&apos;ll work through your real numbers on a call.</p>
          <Btn href="/estimate" variant="accent">See what your workflow could look like</Btn>
        </div>
      </div>
    </div>
  );
}
