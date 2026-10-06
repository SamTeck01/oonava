import Link from "next/link";
import type { Metadata } from "next";
import { services } from "@/lib/content";
import { PageHero, Btn, Arrow } from "@/components/Ui";

export const metadata: Metadata = { title: "Services", description: "AI & workflow automation, integrations, custom software and ongoing support." };

export default function Services() {
  return (
    <>
      <PageHero eyebrow="Services" title={["From one workflow", "to a whole system."]} lead="Oonava covers the full journey: automating repetitive work, connecting your tools, building custom software when tools aren't enough, and keeping it all running." />
      <section className="container-x pb-24 md:pb-32">
        {services.map((s, i) => (
          <Link key={s.slug} href={`/services/${s.slug}`} className="reveal group grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16" style={{ ["--d" as string]: `${i * 0.05}s` }}>
            <p className="eyebrow md:col-span-1">{s.num}</p>
            <div className="md:col-span-4">
              <p className="h2 transition-colors group-hover:text-accent">{s.title}</p>
              <p className="mt-2 text-muted">{s.short}</p>
            </div>
            <div className="md:col-span-6">
              <p className="lead">{s.pitch}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.items.map((it) => <li key={it.title} className="rounded-full bg-surface px-4 py-2 text-sm">{it.title}</li>)}
              </ul>
            </div>
            <div className="hidden justify-end md:col-span-1 md:flex"><span className="more"><span className="dot"><Arrow /></span></span></div>
          </Link>
        ))}
        <div className="reveal mt-12 flex flex-wrap gap-3 border-t border-line pt-12">
          <Btn href="/estimate">Estimate project</Btn>
          <Btn href="/pricing" variant="line">See pricing</Btn>
        </div>
      </section>
    </>
  );
}
