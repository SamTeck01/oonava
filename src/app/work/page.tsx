import Link from "next/link";
import type { Metadata } from "next";
import { demos } from "@/lib/content";
import { PageHero, Arrow, Btn } from "@/components/Ui";
import DemoVisual from "@/components/DemoVisual";

export const metadata: Metadata = { title: "Work", description: "Systems Oonava designs and builds: AI lead handling, follow-up engines and connected operations." };

export default function Work() {
  return (
    <>
      <PageHero eyebrow="Work" title={["Our portfolio."]} lead="Concept systems that show how we approach real business problems: AI, integrations and custom software working together. Client case studies will be added here as projects go live." />
      <section className="container-x space-y-28 pb-24 md:space-y-40 md:pb-32">
        {demos.map((d) => (
          <article key={d.slug}>
            <Link href={`/work/${d.slug}`} className="reveal block transition-transform duration-700 hover:-translate-y-1">
              <div className="rounded-[calc(var(--radius)*1.25)] bg-surface p-3 md:p-10"><DemoVisual kind={d.slug} /></div>
            </Link>
            <div className="mt-8 grid gap-6 md:grid-cols-12">
              <div className="reveal md:col-span-5">
                <p className="eyebrow">{d.num} · Concept · {d.sector}</p>
                <h2 className="h2 mt-3">{d.name}</h2>
              </div>
              <div className="reveal md:col-span-6 md:col-start-7">
                <p className="lead text-muted">{d.solution}</p>
                <ul className="mt-6 flex flex-wrap gap-2">{d.tags.map((t) => <li key={t} className="rounded-full bg-surface px-3 py-1 text-sm">{t}</li>)}</ul>
                <Link href={`/work/${d.slug}`} className="more mt-8"><span className="dot"><Arrow /></span>View case</Link>
              </div>
            </div>
          </article>
        ))}
        <div className="reveal flex flex-col gap-6 border-t border-line pt-12 md:flex-row md:items-center md:justify-between">
          <p className="h3 max-w-xl">Have a process like these? Let&apos;s build yours.</p>
          <Btn href="/estimate">Estimate project</Btn>
        </div>
      </section>
    </>
  );
}
