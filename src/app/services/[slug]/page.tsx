import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { services, steps } from "@/lib/content";
import { PageHero, Split, Btn, More } from "@/components/Ui";
import Faq from "@/components/Faq";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: `${s.title}: ${s.short}`, description: s.pitch } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHero eyebrow={`${s.num} · ${s.short}`} title={[s.title + "."]} lead={s.pitch}>
        <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: ".3s" }}>
          <Btn href="/contact">Book a consultation</Btn>
          <Btn href="/estimate" variant="line">Estimate project</Btn>
        </div>
      </PageHero>

      <section className="container-x pb-8">
        <p className="h3 reveal max-w-4xl">{s.intro}</p>
      </section>

      <Split num="01" title="What we deliver">
        <div className="grid gap-4 sm:grid-cols-2">
          {s.items.map((it, i) => (
            <div key={it.title} className="card reveal flex min-h-[190px] md:min-h-[240px] flex-col justify-between p-6 md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
              <p className="h4">{it.title}</p>
              <p className="mt-6 text-muted">{it.text}</p>
            </div>
          ))}
        </div>
      </Split>

      <Split num="02" title="Examples" className="border-t border-line">
        <ul className="divide-y divide-line border-y border-line">
          {s.examples.map((e, i) => (
            <li key={e} className="reveal flex items-center gap-6 py-6" style={{ ["--d" as string]: `${i * 0.05}s` }}>
              <span className="eyebrow tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="h4">{e}</span>
            </li>
          ))}
        </ul>
      </Split>

      <section className="bg-fg py-24 text-bg md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4"><p className="eyebrow mb-4 !text-bg opacity-60">03</p><h2 className="h2 reveal">As a result, you get</h2></div>
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-white/10 sm:grid-cols-2 md:col-span-8">
            {s.outcomes.map((o, i) => (
              <li key={o} className="reveal bg-fg p-6 md:p-8" style={{ ["--d" as string]: `${i * 0.06}s` }}>
                <span className="text-accent">✓</span>
                <p className="h4 mt-4">{o}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Split num="04" title="Tools we work with">
        <div className="flex flex-wrap gap-3">
          {s.tools.map((t) => <span key={t} className="reveal inline-flex h-12 items-center rounded-full border border-line px-5 font-semibold">{t}</span>)}
        </div>
        <p className="reveal mt-8 max-w-xl text-muted">We pick tools for your situation, not ours. If a tool isn&apos;t listed, ask: if it has an API, we can usually connect it.</p>
      </Split>

      <Split num="05" title="Our process" className="border-t border-line">
        <ol className="space-y-px overflow-hidden rounded-[var(--radius)] bg-line">
          {steps.map((st) => (
            <li key={st.num} className="reveal grid gap-2 bg-bg p-6 md:grid-cols-12 md:p-8">
              <span className="text-2xl font-semibold text-accent-strong md:col-span-2">{st.num}</span>
              <span className="h4 md:col-span-3">{st.title}</span>
              <span className="text-muted md:col-span-7">{st.text}</span>
            </li>
          ))}
        </ol>
      </Split>

      <Split num="FAQ" title="Questions" className="border-t border-line">
        <Faq items={s.faqs} />
      </Split>

      <section className="container-x pb-24">
        <p className="eyebrow reveal mb-6">Other services</p>
        <div className="grid gap-4 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} className="card card-hover reveal p-6 md:p-8">
              <p className="eyebrow">{o.num}</p>
              <p className="h3 mt-2">{o.title}</p>
              <p className="mt-3 text-muted">{o.pitch}</p>
            </Link>
          ))}
        </div>
        <div className="reveal mt-10"><More href="/pricing">See pricing</More></div>
      </section>
    </>
  );
}
