"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "capture" | "follow-up" | "operate";

// Ticks only while on screen; every frame is derived from `t`, so renders stay cheap.
function useTicker(length: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(length - 1); // render complete state first (SSR, no-JS, first glance)
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setT((n) => (n + 1) % length), t === length - 1 ? 3500 : ms);
    return () => clearTimeout(id);
  }, [on, t, length, ms]);
  return { ref, t };
}

function Frame({ url, children, dark = false }: { url: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[18px] border shadow-[0_40px_100px_-50px_rgba(3,3,15,.45)] ${dark ? "border-white/10 bg-[#0b0b16] text-white" : "border-line bg-bg text-fg"}`}>
      <div className={`flex items-center gap-2 border-b px-4 py-3 ${dark ? "border-white/10" : "border-line"}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className={`ml-3 truncate rounded-md px-3 py-1 text-xs ${dark ? "bg-white/5 text-white/60" : "bg-surface text-muted"}`}>{url}</span>
      </div>
      {children}
    </div>
  );
}

const fade = (show: boolean) => `transition-[opacity,transform] duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`;

/* ---------- 01 Capture: inbox + AI lead card ---------- */
const inbox = [
  { n: "Sarah Mitchell", s: "Rightmove", m: "3-bed apartment, Manchester, ~£500k, moving in 3 months" },
  { n: "James Okafor", s: "Website", m: "Looking to rent a 2-bed near Salford Quays" },
  { n: "Priya Shah", s: "Zoopla", m: "Is the Ancoats loft still available?" },
];

function Capture() {
  const { ref, t } = useTicker(12, 900);
  const fields = [["Type", "3-bed apartment"], ["Area", "Manchester"], ["Budget", "£480k – £520k"], ["Timeline", "< 3 months"], ["Intent", "Buying, mortgage in principle"]];
  return (
    <div ref={ref}>
      <Frame url="app.oonava.com/leads">
        <div className="grid min-h-[300px] sm:min-h-[380px] text-[13px] sm:grid-cols-[1fr_1.25fr]">
          <div className="hidden border-r border-line sm:block">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">Inbox</p>
            {inbox.map((e, i) => (
              <div key={e.n} className={`mx-2 mb-1 rounded-xl px-3 py-2.5 ${i === 0 ? "bg-surface" : ""} ${i === 0 && t < 1 ? "ring-1 ring-accent" : ""}`}>
                <div className="flex justify-between gap-2"><b className="truncate">{e.n}</b><span className="text-[11px] text-muted">{e.s}</span></div>
                <p className="mt-0.5 line-clamp-2 text-muted">{e.m}</p>
              </div>
            ))}
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold">Sarah Mitchell</p>
                <p className="text-muted">Rightmove · Sunday 21:47</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold text-white transition-colors duration-500 ${t >= 6 ? "bg-[#c8322f]" : "bg-[#6b7075]"}`}>{t >= 6 ? "HOT · 92" : "Scoring…"}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {fields.map(([k, v], i) => (
                <div key={k} className={`rounded-lg bg-surface px-3 py-2 ${i === 4 ? "col-span-2" : ""} ${fade(t > i)}`}>
                  <p className="text-[11px] text-muted">{k}</p><p className="font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className={`mt-3 rounded-xl border border-line p-3 ${fade(t >= 7)}`}>
              <p className="text-[11px] font-semibold text-accent-strong">AI reply · sent in 38s</p>
              <p className="mt-1 text-muted">Hi Sarah, thanks for your enquiry. We have two 3-bed apartments in your range. Would Tuesday 14:00 or Wednesday 17:30 suit for a viewing?</p>
            </div>
            <div className={`mt-3 flex flex-wrap gap-2 ${fade(t >= 9)}`}>
              <span className="rounded-full bg-[#28c840]/15 px-3 py-1 text-[12px] font-semibold text-[#146c2e]">✓ Viewing booked · Tue 14:00</span>
              <span className="rounded-full bg-surface px-3 py-1 text-[12px]">CRM updated</span>
              <span className="rounded-full bg-surface px-3 py-1 text-[12px]">Agent notified</span>
            </div>
          </div>
        </div>
      </Frame>
    </div>
  );
}

/* ---------- 02 Follow-up: kanban pipeline ---------- */
const cols = ["New", "Nurturing", "Re-engaged", "Ready"];
const cards = [
  { n: "Tom Reed", path: [0, 1, 1, 2, 3, 3] },
  { n: "Aisha Khan", path: [1, 1, 2, 2, 2, 3] },
  { n: "Leo Martin", path: [0, 0, 1, 1, 1, 1] },
  { n: "Emma Clarke", path: [1, 2, 2, 3, 3, 3] },
  { n: "Ben Ade", path: [0, 1, 1, 1, 2, 2] },
];
const counts = [[38, 51, 22, 13], [36, 52, 23, 13], [35, 51, 25, 13], [35, 50, 25, 14], [34, 50, 25, 15], [34, 49, 26, 15]];

function FollowUp() {
  const { ref, t } = useTicker(6, 1400);
  return (
    <div ref={ref}>
      <Frame url="app.oonava.com/pipeline">
        <div className="min-h-[300px] sm:min-h-[380px] p-4 text-[13px] sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold">Follow-up pipeline</p>
            <span className="rounded-full bg-surface px-3 py-1 text-[12px]"><b>124</b> active leads</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {cols.map((c, ci) => (
              <div key={c} className="min-w-0 rounded-xl bg-surface p-2">
                <div className="mb-2 flex items-baseline justify-between gap-1 px-1">
                  <span className="truncate text-[11px] font-semibold text-muted">{c}</span>
                  <b className="tabular-nums">{counts[t][ci]}</b>
                </div>
                <div className="space-y-1.5">
                  {cards.filter((k) => k.path[t] === ci).map((k) => (
                    <div key={k.n} className={`rounded-lg bg-bg p-2 shadow-sm ${ci === 3 ? "ring-1 ring-accent" : ""}`}>
                      <p className="truncate font-semibold">{k.n}</p>
                      <p className="truncate text-[11px] text-muted">{ci === 0 ? "Day 0 reply" : ci === 1 ? `Day ${2 + t}` : ci === 2 ? "Replied" : "Agent alerted"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-line p-3">
            <p className="text-[11px] font-semibold text-accent-strong">Sequence · Emma Clarke</p>
            <div className="mt-2 flex items-center gap-1">
              {["D0", "D2", "D5", "D10"].map((d, i) => (
                <span key={d} className="flex flex-1 items-center gap-1">
                  <span className={`grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[11px] font-semibold transition-colors duration-500 ${i <= t % 5 ? "bg-accent-strong text-white" : "bg-surface text-muted"}`}>{d}</span>
                  {i < 3 && <span className={`h-px flex-1 ${i < t % 5 ? "bg-accent" : "bg-line"}`} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    </div>
  );
}

/* ---------- 03 Operate: event-driven workflow graph ---------- */
const nodes = ["CRM", "Calendar", "Email", "WhatsApp", "Agent", "Database"];

function Operate() {
  const { ref, t } = useTicker(9, 750);
  const lit = (i: number) => t > i;
  return (
    <div ref={ref}>
      <Frame url="app.oonava.com/workflows/viewing-booked" dark>
        <div className="relative min-h-[300px] sm:min-h-[380px] p-4 text-[13px] sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Workflow · viewing booked</p>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${t >= 7 ? "bg-[#28c840]/20 text-[#5ee07f]" : "bg-white/10 text-white/70"}`}>{t >= 7 ? "Completed · 1.8s" : "Running…"}</span>
          </div>
          <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-8">
            <div className="rounded-xl border border-accent bg-accent/15 px-3 py-3 text-center">
              <p className="text-[11px] text-white/60">Trigger</p>
              <p className="font-semibold">Booking</p>
            </div>
            <div className="relative space-y-2">
              <span className="absolute -left-4 top-3 bottom-3 w-px bg-white/15 sm:-left-8" aria-hidden />
              {nodes.map((n, i) => (
                <div key={n} className="relative flex items-center gap-3">
                  <span className={`absolute -left-4 h-px w-4 sm:-left-8 sm:w-8 ${lit(i) ? "bg-accent" : "bg-white/15"} transition-colors duration-300`} aria-hidden />
                  <div className={`flex flex-1 items-center justify-between rounded-lg border px-3 py-2 transition-colors duration-300 ${lit(i) ? "border-accent/60 bg-white/[.06]" : "border-white/10"}`}>
                    <span className="font-semibold">{n}</span>
                    <span className={`text-[11px] ${lit(i) ? "text-[#5ee07f]" : "text-white/40"}`}>
                      {lit(i) ? ["Opportunity updated", "Event created", "Confirmation sent", "Reminder scheduled", "Briefing delivered", "Record saved"][i] : "Waiting"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    </div>
  );
}

export default function DemoVisual({ kind }: { kind: Kind | string }) {
  if (kind === "follow-up") return <FollowUp />;
  if (kind === "operate") return <Operate />;
  return <Capture />;
}
