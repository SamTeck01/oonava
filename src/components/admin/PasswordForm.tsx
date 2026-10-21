"use client";

import { useActionState } from "react";
import { changeMyPassword } from "@/lib/admin/work-actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changeMyPassword, null);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <form action={action} className="space-y-3 rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">Change password</h2>
      <input name="password" type="password" minLength={10} required placeholder="New password (10+ characters)" className={input} autoComplete="new-password" />
      <input name="confirm" type="password" minLength={10} required placeholder="Repeat new password" className={input} autoComplete="new-password" />
      {state?.error && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#146c2e]">{state.ok}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
