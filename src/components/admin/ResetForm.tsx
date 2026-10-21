"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { completePasswordReset } from "@/lib/admin/actions";

// Accepts both link styles Supabase can send: ?token_hash=…&type=recovery (our template) or #access_token=…&type=recovery (default).
export default function ResetForm() {
  const [link, setLink] = useState<{ tokenHash?: string; accessToken?: string; error?: string } | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const err = h.get("error_description") || q.get("error_description");
    if (err) setLink({ error: err.replace(/\+/g, " ") });
    else if (q.get("token_hash")) setLink({ tokenHash: q.get("token_hash")! });
    else if (h.get("access_token")) setLink({ accessToken: h.get("access_token")! });
    else setLink({ error: "This page needs the link from your reset email." });
    // Remove tokens from the address bar and history.
    if (window.location.hash || q.get("token_hash")) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  if (!link) return null;
  if (link.error) return (
    <div className="mt-8 space-y-4">
      <p className="rounded-xl bg-[#fff2d6] p-4 text-sm text-[#7a4b00]">{link.error}</p>
      <Link href="/admin/forgot" className="btn btn-dark w-full">Request a new link</Link>
    </div>
  );
  if (msg?.ok) return (
    <div className="mt-8 space-y-4">
      <p className="rounded-xl bg-[#e3f6e8] p-4 text-sm text-[#146c2e]">{msg.text}</p>
      <Link href="/admin/login" className="btn btn-dark w-full">Sign in</Link>
    </div>
  );
  return (
    <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await completePasswordReset({ ...link, password: pw, confirm }); setMsg(r.ok ? { ok: true, text: r.ok } : { ok: false, text: r.error ?? "Failed." }); }); }}>
      <input className="field" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (10+ characters)" autoComplete="new-password" minLength={10} required autoFocus />
      <input className="field" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" minLength={10} required />
      {msg && !msg.ok && <p className="text-sm text-[#c8322f]">{msg.text}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
