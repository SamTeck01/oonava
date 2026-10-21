import { requireUser } from "@/lib/admin/auth";
import { PERMISSION_LIST } from "@/lib/admin/constants";
import { Panel } from "@/components/admin/Badges";
import PasswordForm from "@/components/admin/PasswordForm";

export const metadata = { title: "My account" };

export default async function Account() {
  const me = await requireUser();
  const mine = PERMISSION_LIST.filter((p) => me.permissions.includes("admin") || me.permissions.includes(p.id));
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
      <Panel title={me.name}>
        <p className="text-sm text-muted">{me.email} · {me.title}</p>
        <p className="mt-4 text-sm font-semibold">You can access</p>
        <ul className="mt-2 flex flex-wrap gap-2">{mine.map((p) => <li key={p.id} className="rounded-full bg-surface px-3 py-1 text-sm">{p.label}</li>)}</ul>
        <p className="mt-3 text-xs text-muted">Need more access? Ask an admin.</p>
      </Panel>
      <PasswordForm />
    </div>
  );
}
