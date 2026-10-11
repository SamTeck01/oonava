"use client";

import { useSyncExternalStore } from "react";

export type Currency = "EUR" | "GBP";
export type Price = { eur: number; gbp: number };

// Shared currency choice: saved per visitor, defaults to £ for UK visitors and € for everyone else.
const listeners = new Set<() => void>();
let current: Currency | null = null;

function detect(): Currency {
  try {
    const saved = localStorage.getItem("currency");
    if (saved === "EUR" || saved === "GBP") return saved;
  } catch {}
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return tz === "Europe/London" || /^en-GB/i.test(navigator.language) ? "GBP" : "EUR";
}

export function setCurrency(c: Currency) {
  current = c;
  try { localStorage.setItem("currency", c); } catch {}
  listeners.forEach((l) => l());
}

export function useCurrency(): Currency {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => (current ??= detect()),
    () => "EUR",
  );
}

export const format = (p: Price, c: Currency) => (c === "GBP" ? "£" + p.gbp.toLocaleString("en-GB") : "€" + p.eur.toLocaleString("en-GB"));

export function Money({ price }: { price: Price }) {
  return <>{format(price, useCurrency())}</>;
}

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const c = useCurrency();
  return (
    <div className={`inline-flex rounded-full border border-line p-1 text-sm font-semibold ${className}`} role="group" aria-label="Currency">
      {(["EUR", "GBP"] as const).map((x) => (
        <button key={x} type="button" aria-pressed={c === x} onClick={() => setCurrency(x)} className={`min-h-9 rounded-full px-4 transition-colors ${c === x ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>
          {x === "EUR" ? "€ EUR" : "£ GBP"}
        </button>
      ))}
    </div>
  );
}
