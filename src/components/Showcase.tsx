"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { demos } from "@/lib/content";
import DemoVisual from "./DemoVisual";
import { Arrow } from "./Ui";

// Hero "showreel": cycles the three concept systems; user can pick a tab.
export default function Showcase() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setI((n) => (n + 1) % demos.length), 9000);
    return () => clearTimeout(id);
  }, [i, auto]);
  const d = demos[i];

  return (
    <div className="rounded-[calc(var(--radius)*1.25)] bg-surface p-3 md:p-6">
      <div className="grid grid-cols-3 gap-1 rounded-full bg-bg p-1" role="tablist" aria-label="Concept systems">
        {demos.map((x, n) => (
          <button
            key={x.slug}
            role="tab"
            aria-selected={n === i}
            onClick={() => { setI(n); setAuto(false); }}
            className={`relative min-h-11 overflow-hidden rounded-full px-2 text-sm font-semibold transition-colors duration-300 md:text-base ${n === i ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
          >
            <span className="hidden sm:inline">{x.num} · </span>{x.title}
            {n === i && auto && <span key={i} className="absolute bottom-0 left-0 h-[2px] w-full origin-left animate-[grow_9s_linear] bg-accent" />}
          </button>
        ))}
      </div>
      <div className="mt-4 grid items-center gap-6 md:mt-6 lg:grid-cols-12 lg:gap-10">
        <div key={d.slug} className="order-2 px-2 pb-2 lg:order-1 lg:col-span-4 lg:px-4 [animation:rise_.6s_var(--ease-out)_both]">
          <p className="eyebrow mb-2">{d.num} · Concept system · {d.sector}</p>
          <p className="h3">{d.name}</p>
          <p className="mt-3 text-muted">{d.solution}</p>
          <Link href={`/work/${d.slug}`} className="more mt-6"><span className="dot"><Arrow /></span>View case</Link>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-8">
          <DemoVisual kind={d.slug} />
        </div>
      </div>
    </div>
  );
}
