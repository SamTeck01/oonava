import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { demos } from "@/lib/content";
import { PageHero, Btn, Split } from "@/components/Ui";
import Pipeline from "@/components/Pipeline";

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = demos.find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.line } : {};
}

export default async function Demo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = demos.find((x) => x.slug === slug);
  if (!d) notFound();
  const next = demos[(demos.indexOf(d) + 1) % demos.length];

  return (
    <>
      <PageHero eyebrow={`${d.num} · Concept demo`} title={[d.name + "."]} lead={d.line} />
      <section className="container-x grid gap-10 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow reveal mb-3">The problem</p>
          <p className="h3 reveal">“{d.problem}”</p>
          <p className="reveal mt-8 text-muted">Here&apos;s what happens when Oonava runs the workflow instead. Each step runs automatically, and a person steps in when there&apos;s a real conversation to have.</p>
          <div className="reveal mt-10 flex flex-wrap gap-3">
            <Btn href="/contact">I want this</Btn>
            <Btn href="/estimate" variant="line">Estimate your automation</Btn>
          </div>
        </div>
        <div className="reveal lg:col-span-6 lg:col-start-7">
          <Pipeline steps={d.steps} title={d.name} source="Concept preview · sample data" interval={950} />
          <p className="mt-4 text-sm text-muted">An interactive version you can try yourself is coming soon.</p>
        </div>
      </section>
      <Split num="Step by step" title="What the system does" className="border-t border-line">
        <ol className="space-y-px overflow-hidden rounded-[var(--radius)] bg-line">
          {d.steps.map((s, i) => (
            <li key={s} className="reveal flex items-center gap-6 bg-bg p-5 md:p-6">
              <span className="w-10 text-xl font-semibold text-accent-strong tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="h4">{s}</span>
            </li>
          ))}
        </ol>
      </Split>
      <section className="container-x pb-24">
        <Link href={`/work/${next.slug}`} className="card card-hover reveal flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div><p className="eyebrow">Next concept</p><p className="h2 mt-2">{next.name}</p></div>
          <span className="btn btn-dark">View →</span>
        </Link>
      </section>
    </>
  );
}
