"use client";

import { useState, useTransition } from "react";
import { generateEmail, sendLeadEmail } from "@/lib/admin/actions";
import type { Purpose } from "@/lib/admin/ai";

const purposes: { id: Purpose; label: string }[] = [
  { id: "reply", label: "Reply to enquiry" },
  { id: "follow-up", label: "Follow up" },
  { id: "book-call", label: "Push to book a call" },
  { id: "after-call", label: "After the call" },
  { id: "outreach", label: "Cold outreach" },
  { id: "win-back", label: "Win back" },
];

export default function EmailComposer({ id, name, unsubscribed }: { id: string; name: string; unsubscribed: boolean }) {
  const [purpose, setPurpose] = useState<Purpose>("follow-up");
  const [extra, setExtra] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [booking, setBooking] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [drafting, startDraft] = useTransition();
  const [sending, startSend] = useTransition();

  const draft = () => startDraft(async () => {
    setMsg(null);
    const r = await generateEmail(id, purpose, extra);
    setSubject(r.subject); setBody(r.body);
    if (!r.aiUsed) setMsg({ ok: false, text: "AI isn't available right now, so this is a template. Edit it before sending." });
  });

  const send = () => startSend(async () => {
    const r = await sendLeadEmail(id, subject, body, booking);
    setMsg(r.ok ? { ok: true, text: `Sent to ${name}.` } : { ok: false, text: r.error ?? "Failed." });
    if (r.ok) { setSubject(""); setBody(""); }
  });

  if (unsubscribed) return <section className="rounded-[20px] border border-line bg-bg p-6 text-sm text-muted">This person unsubscribed, so emailing is disabled.</section>;

  return (
    <section className="rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">Write an email with AI</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {purposes.map((p) => <button key={p.id} type="button" onClick={() => setPurpose(p.id)} className={`chip min-h-9 text-sm ${purpose === p.id ? "on" : ""}`}>{p.label}</button>)}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Anything to mention? (optional)" className="min-h-11 flex-1 rounded-xl border border-line bg-bg px-3" />
        <button type="button" onClick={draft} disabled={drafting} className="btn btn-accent min-h-11">{drafting ? "Writing…" : "✨ Draft it"}</button>
      </div>
      {(subject || body) && (
        <div className="mt-4 space-y-3">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-bg px-3 font-semibold" aria-label="Subject" />
          <div className="rounded-xl border border-line p-3 text-sm">
            <p className="text-muted">Hi {name.split(" ")[0]},</p>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-2 w-full resize-y bg-transparent outline-none" aria-label="Message" />
            <p className="text-muted">Best,<br />The Oonava team</p>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={booking} onChange={(e) => setBooking(e.target.checked)} /> Add &quot;Book a call&quot; button</label>
          <button type="button" onClick={send} disabled={sending || !subject || !body} className="btn btn-dark w-full">{sending ? "Sending…" : "Send email"}</button>
        </div>
      )}
      {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-[#146c2e]" : "text-[#c8322f]"}`}>{msg.text}</p>}
    </section>
  );
}
