"use client";

import { useState } from "react";
import { Arrow } from "./Ui";
import { track } from "./Analytics";

type Result = { budget: string; area: string; timeline: string; propertyType: string; score: "Hot" | "Warm" | "Cold"; reply: string; slots: string[]; emailed: boolean; seconds: number };

const steps = ["Enquiry received", "AI reads and qualifies it", "Logged in the CRM", "Personal reply + viewing slots sent"];
const example = "Hi, I saw the 3-bed flat in Didsbury. We're looking to buy around £350k and want to move within 2 months. Is it still available?";

export default function LiveDemo() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [step, setStep] = useState(0);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("running"); setStep(0); setErr("");
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 900);
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await r.json();
      if (!r.ok) throw new Error(r.status === 429 ? "You've tried the demo a few times. Please wait a few minutes." : json.error ?? "Something went wrong.");
      clearInterval(timer); setStep(steps.length); setRes(json); setState("done");
      track("demo_tried");
    } catch (e) {
      clearInterval(timer); setErr(e instanceof Error ? e.message : "Something went wrong."); setState("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-2 p-6 md:p-10">
        <p className="h4">Send an enquiry like a buyer would</p>
        <p className="pb-2 text-sm text-muted">You&apos;re enquiring with Northgate Estates, a fictional agency. Use your real email to see the reply land.</p>
        <input className="field" name="name" required placeholder="Your name *" autoComplete="name" />
        <input className="field" name="email" type="email" required placeholder="Email *" autoComplete="email" />
        <textarea className="field min-h-[120px] resize-y" name="message" required defaultValue={example} aria-label="Your property enquiry" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <div className="pt-6">
          <button type="submit" className="btn btn-accent w-full sm:w-auto" disabled={state === "running"}>
            {state === "running" ? "Running…" : state === "done" ? "Try again" : "Send enquiry"} <Arrow />
          </button>
          <p className="mt-4 text-xs text-muted">We&apos;ll email you the demo reply and may follow up once about Oonava. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
        </div>
      </form>

      <div className="rounded-[var(--radius)] bg-fg p-6 text-bg md:p-10" aria-live="polite">
        <p className="eyebrow mb-6 !text-bg opacity-60">Behind the scenes</p>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const done = state === "done" || (state === "running" && i < step);
            const active = state === "running" && i === step;
            return (
              <li key={s} className={`flex items-center gap-3 transition-opacity duration-300 ${done || active ? "opacity-100" : "opacity-40"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${done ? "bg-accent text-white" : "border border-current"}`}>{done ? "✓" : i + 1}</span>
                <span>{s}{active && "…"}</span>
              </li>
            );
          })}
        </ol>

        {state === "done" && res && (
          <div className="mt-8 space-y-6">
            <p className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-none tracking-tight text-accent">{res.seconds}s</p>
            <p className="-mt-4 text-sm opacity-70">from enquiry to personal reply{res.emailed ? ". Check your inbox." : " (email sending isn't switched on yet, so here's what it wrote)."}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([["Lead score", res.score], ["Budget", res.budget], ["Area", res.area], ["Timeline", res.timeline]] as const).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/15 p-3"><p className="opacity-60">{k}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-sm leading-relaxed">
              <p className="mb-2 opacity-60">Reply sent:</p>
              <p className="whitespace-pre-line">{res.reply}</p>
              <ul className="mt-3 list-disc pl-5 opacity-80">{res.slots.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </div>
        )}
        {state === "error" && <p className="mt-8 text-sm text-red-400">{err}</p>}
        {state === "idle" && <p className="mt-8 text-sm opacity-60">Press send and watch each step happen.</p>}
      </div>
    </div>
  );
}
