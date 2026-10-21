import { requireAny } from "@/lib/admin/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/admin/store";
import { tiers } from "@/lib/content";
import ProposalBuilder from "@/components/admin/ProposalBuilder";

export const metadata = { title: "Proposal" };

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAny(["sales"]);
  const { id } = await params;
  const l = await getLead(id);
  if (!l) notFound();
  const tier = tiers.find((t) => t.name === l.tier) ?? tiers[1];
  return (
    <div className="space-y-6">
      <Link href={`/admin/leads/${l.id}`} className="text-sm text-muted hover:text-fg print:hidden">← {l.name}</Link>
      <ProposalBuilder
        id={l.id}
        client={{ name: l.name, company: l.company, email: l.email }}
        tiers={tiers.map((t) => ({ name: t.name, setup: t.setup.eur, monthly: t.monthly.eur }))}
        initial={{ tier: tier.name, setup: l.dealValue || tier.setup.eur, monthly: l.monthlyValue || tier.monthly.eur }}
      />
    </div>
  );
}
