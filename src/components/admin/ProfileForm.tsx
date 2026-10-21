"use client";

import { useActionState } from "react";
import { updateMyProfile } from "@/lib/admin/work-actions";

export default function ProfileForm({ name, personal, login }: { name: string; personal: string; login: string }) {
  const [state, action, pending] = useActionState(updateMyProfile, null);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <form action={action} className="space-y-3 rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">Profile &amp; notifications</h2>
      {!personal && <p className="rounded-xl bg-[#fff2d6] p-3 text-sm text-[#7a4b00]">Add your personal email so you get approvals, tasks and alerts.</p>}
      <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Name</span><input name="name" defaultValue={name} className={input} /></label>
      <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Work login (can&apos;t be changed here)</span><input value={login} disabled className={`${input} opacity-60`} /></label>
      <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Personal email for notifications</span><input name="personal_email" type="email" defaultValue={personal} required placeholder="you@gmail.com" className={input} /></label>
      {state?.error && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#146c2e]">{state.ok}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
