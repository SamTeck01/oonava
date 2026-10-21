"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/admin/actions";

export default function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  if (state && "ok" in state) return <p className="mt-8 rounded-xl bg-[#e3f6e8] p-4 text-sm text-[#146c2e]">{state.ok}</p>;
  return (
    <form action={action} className="mt-8 space-y-4">
      <input className="field" type="email" name="email" placeholder="Work email, e.g. you@oonava.com" autoComplete="username" required autoFocus />
      {state && "error" in state && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}
