"use client";

import { useActionState } from "react";
import { inviteUser } from "@/lib/admin/work-actions";
import { PERMISSION_LIST } from "@/lib/admin/constants";

export default function InviteForm() {
  const [state, action, pending] = useActionState(inviteUser, null);
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <form action={action} className="space-y-3 rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">Add a team member</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="name" required placeholder="Full name *" className={input} />
        <input name="email" type="email" required placeholder="Work login, e.g. name@oonava.com *" className={input} />
        <input name="personal_email" type="email" placeholder="Personal email (for notifications)" className={input} />
        <input name="title" placeholder="Role title, e.g. Sales" className={input} />
        <input name="password" type="text" required minLength={10} placeholder="Temporary password (10+) *" className={input} autoComplete="off" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {PERMISSION_LIST.map((p) => (
          <label key={p.id} className="flex items-start gap-2 rounded-xl border border-line p-2.5 text-sm">
            <input type="checkbox" name={`perm_${p.id}`} className="mt-0.5" />
            <span><b>{p.label}</b><span className="block text-xs text-muted">{p.hint}</span></span>
          </label>
        ))}
      </div>
      {state?.error && <p className="text-sm text-[#c8322f]">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#146c2e]">{state.ok}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? "Adding…" : "Add member"}</button>
    </form>
  );
}
