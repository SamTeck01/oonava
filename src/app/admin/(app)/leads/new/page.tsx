import { tiers } from "@/lib/content";
import NewLeadForm from "@/components/admin/NewLeadForm";
import ImportCsv from "@/components/admin/ImportCsv";

export const metadata = { title: "Add leads" };

export default function NewLead() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add leads</h1>
        <p className="text-sm text-muted">Add someone you met, or import a list (Gemini Spark, LinkedIn, events).</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <NewLeadForm tiers={tiers.map((t) => t.name)} />
        <ImportCsv />
      </div>
    </div>
  );
}
