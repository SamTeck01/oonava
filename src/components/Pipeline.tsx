"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  steps: string[];
  title?: string;
  source?: string;
  interval?: number;
  className?: string;
};

// A looping "live system" card. Only re-renders on step change and pauses off-screen.
export default function Pipeline({ steps, title = "New enquiry", source = "Website form", interval = 850, className = "" }: Props) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(steps.length); return; }
    const t = setTimeout(() => setI((n) => (n > steps.length + 2 ? 0 : n + 1)), i > steps.length ? 2600 : interval);
    return () => clearTimeout(t);
  }, [i, visible, steps.length, interval]);

  const done = Math.min(i, steps.length);
  const secs = ((done * interval) / 1000 * 0.9).toFixed(1);

  return (
    <div ref={ref} className={`rounded-[var(--radius)] border border-line bg-bg p-5 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)] md:p-7 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted">{source}</p>
        </div>
        <span className="rounded-full bg-surface px-3 py-1 font-mono text-sm tabular-nums">{secs}s</span>
      </div>
      <ol className="space-y-1">
        {steps.map((s, n) => {
          const state = n < done ? "done" : n === done ? "run" : "wait";
          return (
            <li key={s} className="flex items-center gap-3 rounded-xl px-2 py-[7px]">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] transition-colors duration-300 ${
                  state === "done" ? "border-accent bg-accent-strong text-white" : state === "run" ? "border-accent text-accent-strong" : "border-line text-muted"
                }`}
                aria-hidden
              >
                {state === "done" ? "✓" : String(n + 1).padStart(2, "0").slice(-1)}
              </span>
              <span className={`text-[.95rem] transition-colors duration-300 ${state === "wait" ? "text-muted" : ""} ${state === "run" ? "font-semibold" : ""}`}>{s}</span>
              {state === "run" && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            </li>
          );
        })}
      </ol>
      <div className={`mt-5 rounded-2xl bg-surface p-4 text-sm transition-opacity duration-500 ${i >= steps.length ? "opacity-100" : "opacity-0"}`}>
        <b>Done in {secs}s.</b> <span className="text-muted">Nobody on your team lifted a finger.</span>
      </div>
    </div>
  );
}
