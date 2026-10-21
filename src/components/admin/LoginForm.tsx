"use client";

import { useActionState } from "react";
import { login } from "@/lib/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input className="field" type="password" name="password" placeholder="Password" autoComplete="current-password" required autoFocus />
      {state?.error && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
