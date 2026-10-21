import { listLeads, estimatedValue } from "@/lib/admin/store";
import LeadsBoard from "@/components/admin/LeadsBoard";

export const metadata = { title: "Pipeline" };

export default async function Leads({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const leads = (await listLeads()).map((l) => ({ id: l.id, name: l.name, company: l.company, email: l.email, summary: l.summary || l.message, status: l.status, score: l.score, tier: l.tier, source: l.source, created: l.created, value: estimatedValue(l), nextAction: l.nextAction }));
  return <LeadsBoard leads={leads} initialStatus={status ?? ""} />;
}
