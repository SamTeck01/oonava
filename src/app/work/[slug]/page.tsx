import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { demos } from "@/lib/content";
import { Btn, Split, Lines } from "@/components/Ui";
import DemoVisual from "@/components/DemoVisual";
import Pipeline from "@/components/Pipeline";

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = demos.find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.solution } : {};
}

export default async function Case({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = demos.find((x) => x.slug === slug);
  if (!d) notFound();
  const next = demos[(demos.indexOf(d) + 1) % demos.length];

  return (
    <>
      <section className="hero container-x pt-36 pb-12 md:pt-48">
        <p className="eyebrow reveal mb-6">{d.num} · Concept system · {d.sector}</p>
        <Lines lines={[d.name + "."]} className="h1 max-w-[14ch]" />
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="lead reveal text-muted md:col-span-7" style={{ ["--d" as string]: ".2s" }}>{d.line} {d.solution}</p>
          <ul className="reveal flex flex-wrap content-start gap-2 md:col-span-4 md:col-start-9" style={{ ["--d" as string]: ".3s" }}>
            {d.tags.map((t) => <li key={t} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="container-x pb-8">
        <div className="reveal rounded-[calc(var(--radius)*1.5)] bg-surface p-3 md:p-14"><DemoVisual kind={d.slug} /></div>
        <p className="mt-4 text-sm text-muted">Concept system with sample data. An interactive version is in development.</p>
      </section>

      <Split num="01" title="The challenge" className="border-b border-line">
        <p className="h3 reveal">{d.challenge}</p>
        <p className="reveal mt-6 text-muted">Example business challenge: “{d.problem}”</p>
      </Split>

      <Split num="02" title="The solution" className="border-b border-line">
        <p className="h3 reveal">{d.solution}</p>
      </Split>

      <section className="bg-fg py-24 text-bg md:py-32">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-bg opacity-60">03</p>
            <h2 className="h2 reveal">How it works, step by step</h2>
            <p className="lead reveal mt-6 opacity-70">Each step runs automatically. A person steps in only when there&apos;s a real decision or conversation to have.</p>
          </div>
          <div className="reveal text-fg"><Pipeline steps={d.steps} title={d.name} source="Live run · sample data" interval={900} /></div>
        </div>
      </section>

      <Split num="04" title="Technology">
        <div className="flex flex-wrap gap-3">
          {d.stack.map((t) => <span key={t} className="reveal inline-flex h-12 items-center rounded-full bg-surface px-5 font-semibold">{t}</span>)}
        </div>
      </Split>

      <Split num="05" title="What the business gets" className="border-t border-line">
        <div className="grid gap-4 sm:grid-cols-3">
          {["Hours of manual work removed", "Faster, consistent responses", "Every action logged and visible"].map((r, i) => (
            <div key={r} className="card reveal p-6" style={{ ["--d" as string]: `${i * 0.08}s` }}><p className="h4">{r}</p></div>
          ))}
        </div>
        <div className="reveal mt-12 flex flex-wrap gap-3">
          <Btn href="/estimate">Estimate a similar project</Btn>
          <Btn href="/contact" variant="line">Book a consultation</Btn>
        </div>
      </Split>

      <section className="container-x pb-24">
        <Link href={`/work/${next.slug}`} className="card card-hover reveal flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div><p className="eyebrow">Next case</p><p className="h2 mt-2">{next.name}</p></div>
          <span className="btn btn-dark">View case →</span>
        </Link>
      </section>
    </>
  );
}
