import Link from "next/link";
import type { Metadata } from "next";
import { demos } from "@/lib/content";
import { PageHero, Arrow } from "@/components/Ui";
import Pipeline from "@/components/Pipeline";

export const metadata: Metadata = { title: "Work", description: "Concept demos of the systems Oonava builds: lead conversion, follow-up and operations." };

export default function Work() {
  return (
    <>
      <PageHero eyebrow="Work" title={["See the system", "in action."]} lead="Three concept systems that show how Oonava turns enquiries into appointments, keeps leads warm and removes admin. Interactive versions and client case studies are on the way." />
      <section className="container-x space-y-4 pb-24 md:pb-32">
        {demos.map((d) => (
          <Link key={d.slug} href={`/work/${d.slug}`} className="card card-hover reveal group grid items-center gap-8 p-6 md:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{d.num} · Concept demo</p>
              <p className="h1 !text-[clamp(2.5rem,6vw,4.5rem)]">{d.title}</p>
              <p className="lead mt-4 text-muted">{d.line}</p>
              <span className="more mt-8"><span className="dot"><Arrow /></span>{d.name}</span>
            </div>
            <Pipeline steps={d.steps} title={d.name} source="Concept preview" interval={700} />
          </Link>
        ))}
        <p className="reveal pt-6 text-sm text-muted">Concept demos use sample data to show how the systems work. They are not client results.</p>
      </section>
    </>
  );
}
