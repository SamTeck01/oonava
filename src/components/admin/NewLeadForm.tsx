"use client";

import { useActionState } from "react";
import { newLead } from "@/lib/admin/actions";

export default function NewLeadForm({ tiers, people }: { tiers: string[]; people: { email: string; name: string }[] }) {
  const [state, action, pending] = useActionState(async (_: unknown, f: FormData) => newLead(f), null);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  const label = "mb-1 block text-xs font-semibold text-muted";
  return (
    <form action={action} className="space-y-3 rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">One lead</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className={label}>Name *</span><input name="name" required className={input} /></label>
        <label><span className={label}>Email *</span><input name="email" type="email" required className={input} /></label>
        <label><span className={label}>Company</span><input name="company" className={input} /></label>
        <label><span className={label}>Phone</span><input name="phone" className={input} placeholder="+44…" /></label>
        <label><span className={label}>Industry</span><input name="industry" className={input} placeholder="Real estate" /></label>
        <label><span className={label}>Source</span>
          <select name="source" className={input}><option>Manual</option><option>Gemini Spark</option><option>LinkedIn</option><option>Referral</option><option>Event</option><option>Cold call</option></select>
        </label>
      </div>
      <label className="block"><span className={label}>Assign to</span>
        <select name="assignedTo" className={input}><option value="">Nobody yet</option>{people.map((p) => <option key={p.email} value={p.email}>{p.name}</option>)}</select>
      </label>
      <label className="block"><span className={label}>Likely package</span>
        <select name="tier" className={input}><option value="">Not sure yet</option>{tiers.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <label className="block"><span className={label}>What do they need?</span><textarea name="message" rows={3} className="w-full rounded-xl border border-line bg-bg p-3" /></label>
      <label className="block"><span className={label}>Notes</span><textarea name="notes" rows={2} className="w-full rounded-xl border border-line bg-bg p-3" /></label>
      {state?.error && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Saving…" : "Add lead"}</button>
    </form>
  );
}
