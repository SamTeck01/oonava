import { requireUser } from "@/lib/admin/auth";
import { can, allUsers } from "@/lib/admin/team";
import { redirect } from "next/navigation";
import { PERMISSION_LIST } from "@/lib/admin/constants";
import { updateUser, resetPassword } from "@/lib/admin/work-actions";
import { ago } from "@/lib/admin/format";
import { Panel } from "@/components/admin/Badges";
import InviteForm from "@/components/admin/InviteForm";

export const metadata = { title: "Team" };

export default async function Team() {
  const me = await requireUser();
  if (!can(me, "admin")) redirect("/admin?denied=1");
  const team = await allUsers();
  const input = "min-h-11 w-full rounded-xl border border-line bg-bg px-3";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted">Give each person their own login and switch on what they can do. Changes apply immediately; switching someone off removes their access at once.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {team.map((u) => (
          <Panel key={u.id} title={u.name} action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.active ? "bg-[#e3f6e8] text-[#146c2e]" : "bg-surface text-muted"}`}>{u.active ? "Active" : "Off"}</span>}>
            <p className="-mt-2 mb-4 text-sm text-muted">{u.email}{u.last_login ? ` · last in ${ago(String(u.last_login))}` : " · never signed in"}</p>
            <form action={updateUser.bind(null, u.id)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="name" defaultValue={u.name} className={input} aria-label="Name" />
                <input name="title" defaultValue={u.title} placeholder="Role title" className={input} aria-label="Role title" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERMISSION_LIST.map((p) => (
                  <label key={p.id} className="flex items-start gap-2 rounded-xl border border-line p-2.5 text-sm">
                    <input type="checkbox" name={`perm_${p.id}`} defaultChecked={u.permissions.includes(p.id)} className="mt-0.5" />
                    <span><b>{p.label}</b><span className="block text-xs text-muted">{p.hint}</span></span>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={u.active} /> Account active</label>
              <button className="btn btn-dark w-full">Save access</button>
            </form>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-muted">Reset password</summary>
              <form action={resetPassword.bind(null, u.id)} className="mt-2 flex gap-2">
                <input name="password" type="text" minLength={10} required placeholder="New temporary password (10+)" className={input} autoComplete="off" />
                <button className="btn btn-line min-h-11 shrink-0">Set</button>
              </form>
            </details>
          </Panel>
        ))}
      </div>
      <InviteForm />
    </div>
  );
}
