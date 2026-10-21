import { requireAny } from "@/lib/admin/auth";
import { tiers } from "@/lib/content";
import NewLeadForm from "@/components/admin/NewLeadForm";
import ImportCsv from "@/components/admin/ImportCsv";
import { teamMap } from "@/lib/admin/views";

export const metadata = { title: "Add leads" };

export default async function NewLead() {
  await requireAny(["sales", "outreach", "marketing"]);
  const people = (await teamMap()).list.filter((u) => u.active).map((u) => ({ email: u.email, name: u.name }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add leads</h1>
        <p className="text-sm text-muted">Add someone you met, or import a list (Gemini Spark, LinkedIn, events).</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <NewLeadForm tiers={tiers.map((t) => t.name)} people={people} />
        <ImportCsv people={people} />
      </div>
    </div>
  );
}
