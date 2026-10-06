"use client";

import { useState } from "react";
import { Arrow } from "./Ui";

export default function ContactForm({ context, compact = false }: { context?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, context }) });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="card p-8 md:p-10">
        <p className="h3">Thank you.</p>
        <p className="mt-3 text-muted">We&apos;ll reply within one working day to arrange your consultation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className={`grid gap-x-8 ${compact ? "" : "md:grid-cols-2"}`}>
        <input className="field" name="name" required placeholder="Your name *" autoComplete="name" />
        <input className="field" name="email" type="email" required placeholder="Work email *" autoComplete="email" />
        <input className="field" name="company" placeholder="Company" autoComplete="organization" />
        <input className="field" name="phone" placeholder="Phone (optional)" autoComplete="tel" />
      </div>
      <textarea className="field min-h-[110px] resize-y" name="message" placeholder="What would you like to automate?" />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">By sending, you agree to our <a href="/privacy" className="underline">privacy policy</a>.</p>
        <button type="submit" className="btn btn-accent" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Book my consultation"} <Arrow />
        </button>
      </div>
      {state === "error" && <p className="text-sm text-red-500">Something went wrong. Please email us at hello@oonava.com.</p>}
    </form>
  );
}
