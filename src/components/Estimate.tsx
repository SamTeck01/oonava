"use client";

import { useState } from "react";
import ContactForm from "./ContactForm";
import { Arrow } from "./Ui";

const questions = [
  { key: "area", q: "What do you want to automate?", multi: true, options: ["Lead response", "Follow-up", "Booking & calendars", "CRM updates", "Documents & forms", "Reporting", "Internal admin", "Something custom"] },
  { key: "tools", q: "Which tools are involved?", multi: true, options: ["Email (Gmail / Outlook)", "A CRM", "Property portals", "Spreadsheets", "Calendar", "WhatsApp / SMS", "Custom software", "Not sure"] },
  { key: "people", q: "How many people handle this today?", multi: false, options: ["Just me", "2–3", "4–10", "10+"] },
  { key: "freq", q: "How often does it happen?", multi: false, options: ["Many times a day", "Daily", "Weekly", "Occasionally"] },
  { key: "time", q: "Roughly how much time does it take each week?", multi: false, options: ["Under 5 hours", "5–15 hours", "15–40 hours", "40+ hours"] },
] as const;

type Answers = Record<string, string[]>;

function recommend(a: Answers) {
  const n = (a.area?.length ?? 0) + (a.tools?.includes("Custom software") ? 2 : 0) + (a.area?.includes("Something custom") ? 2 : 0);
  const big = a.time?.[0] === "40+ hours" || a.people?.[0] === "10+";
  if (n >= 5 || (big && n >= 3)) return { tier: "Custom Systems", price: "from €10,000 setup · from €999/month", why: "Several connected processes and custom software usually need a purpose-built system." };
  if (n >= 2) return { tier: "Connected Automation + AI", price: "€4,500 setup · €499/month", why: "Your processes connect to each other, so automating them end to end gives the biggest return." };
  return { tier: "Essential Automation", price: "€1,500 setup · €199/month", why: "One focused workflow, done properly, is the fastest win." };
}

export default function Estimate() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const q = questions[step];
  const finished = step >= questions.length;

  const toggle = (opt: string) => {
    if (!q) return;
    setA((prev) => {
      const cur = prev[q.key] ?? [];
      if (!q.multi) return { ...prev, [q.key]: [opt] };
      return { ...prev, [q.key]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
    });
    if (!q.multi) setTimeout(() => setStep((s) => s + 1), 220);
  };

  if (finished) {
    const r = recommend(a);
    const summary = questions.map((x) => `${x.q} ${(a[x.key] ?? []).join(", ") || "-"}`).join("\n");
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[var(--radius)] bg-fg p-8 text-bg md:p-10">
          <p className="opacity-70">Your workflow looks like a strong candidate for automation.</p>
          <p className="mt-6 text-sm uppercase tracking-widest opacity-60">Likely fit</p>
          <p className="h2 mt-2">{r.tier}</p>
          <p className="mt-3 text-accent">{r.price}</p>
          <p className="mt-6 opacity-80">{r.why}</p>
          <p className="mt-8 text-sm opacity-60">This is a starting point, not a quote. You get a fixed price after a free mapping call.</p>
          <button onClick={() => { setStep(0); setA({}); }} className="mt-8 text-sm underline opacity-80">Start again</button>
        </div>
        <div>
          <p className="h3 mb-2">Book your free mapping call</p>
          <p className="mb-6 text-muted">We&apos;ll map the process with you and show what Oonava could take off your team&apos;s plate.</p>
          <ContactForm context={`Estimate: ${r.tier}\n${summary}`} compact />
        </div>
      </div>
    );
  }

  const chosen = a[q.key] ?? [];
  return (
    <div className="card p-6 md:p-12">
      <div className="mb-10 flex items-center gap-4">
        <span className="eyebrow tabular-nums">{String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
        <span className="h-[2px] flex-1 overflow-hidden rounded bg-line">
          <span className="block h-full origin-left bg-accent transition-transform duration-500" style={{ transform: `scaleX(${(step + 1) / questions.length})` }} />
        </span>
      </div>
      <p key={q.key} className="h3 mb-8">{q.q}</p>
      <div className="flex flex-wrap gap-3">
        {q.options.map((o) => (
          <button key={o} type="button" className="chip" aria-pressed={chosen.includes(o)} onClick={() => toggle(o)}>{o}</button>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={`text-muted hover:text-fg ${step === 0 ? "invisible" : ""}`}>← Back</button>
        {q.multi && (
          <button type="button" className="btn btn-dark" disabled={!chosen.length} onClick={() => setStep((s) => s + 1)} style={{ opacity: chosen.length ? 1 : 0.4 }}>
            Next <Arrow />
          </button>
        )}
      </div>
    </div>
  );
}
