import type { Metadata } from "next";
import { PageHero } from "@/components/Ui";
import Estimate from "@/components/Estimate";

export const metadata: Metadata = { title: "Estimate your automation", description: "Five quick questions to find which Oonava package fits your workflow." };

export default function EstimatePage() {
  return (
    <>
      <PageHero eyebrow="Estimate your automation" title={["Five questions.", "One minute."]} lead="Tell us about the work you want off your team's plate and we'll show you which package fits, with prices." />
      <section className="container-x pb-24 md:pb-32"><div className="reveal"><Estimate /></div></section>
    </>
  );
}
