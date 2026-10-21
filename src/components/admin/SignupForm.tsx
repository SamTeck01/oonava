"use client";

import { useActionState } from "react";
import { signup } from "@/lib/admin/actions";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, null);
  if (state && "ok" in state && typeof state.ok === "string") return <p className="mt-8 rounded-xl bg-[#e3f6e8] p-4 text-sm text-[#146c2e]">{state.ok}</p>;
  return (
    <form action={action} className="mt-8 space-y-4">
      <input className="field" name="name" placeholder="Full name" autoComplete="name" required />
      <input className="field" type="email" name="email" placeholder="Work email, e.g. you@oonava.com" autoComplete="username" required />
      <input className="field" name="title" placeholder="Your role (optional)" />
      <input className="field" type="password" name="password" placeholder="Password (10+ characters)" autoComplete="new-password" minLength={10} required />
      <input className="field" type="password" name="confirm" placeholder="Repeat password" autoComplete="new-password" minLength={10} required />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state && "error" in state && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Sending…" : "Request account"}</button>
    </form>
  );
}
