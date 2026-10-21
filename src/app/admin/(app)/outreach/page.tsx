import { requireAny } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { listLeads } from "@/lib/admin/store";
import OutreachDesk from "@/components/admin/OutreachDesk";

export const metadata = { title: "Outreach" };

export default async function Outreach() {
  const me = await requireAny(["outreach", "sales"]);
  const today = new Date().toISOString().slice(0, 10);
  const all = await listLeads();
  const visible = all.filter((l) => !l.assignedTo || l.assignedTo === me.email || can(me, "admin"));
  const due = (l: (typeof all)[number]) => l.status === "New" || ((l.status === "Contacted" || l.status === "Replied") && !!l.nextAction && l.nextAction <= today);
  const queue = visible
    .filter((l) => due(l) && l.status !== "Unsubscribed")
    .sort((a, b) => Number(b.assignedTo === me.email) - Number(a.assignedTo === me.email) || (a.nextAction || "").localeCompare(b.nextAction || ""))
    .map((l) => ({ id: l.id, name: l.name, company: l.company, email: l.email, phone: l.phone, industry: l.industry, notes: l.notes, summary: l.summary, status: l.status, source: l.source, nextAction: l.nextAction, mine: l.assignedTo === me.email, activity: l.activity.split("\n").slice(0, 5) }));
  const doneToday = all.filter((l) => l.activity.split("\n").some((a) => a.startsWith(today) && a.includes(`${me.name}:`))).length;
  return <OutreachDesk queue={queue} doneToday={doneToday} me={me.name} />;
}
