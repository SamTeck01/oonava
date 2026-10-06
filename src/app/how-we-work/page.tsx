import type { Metadata } from "next";
import { steps } from "@/lib/content";
import { PageHero, Btn } from "@/components/Ui";

export const metadata: Metadata = { title: "How we work", description: "Discover, map, build, launch, improve: how Oonava delivers automation projects." };

export default function HowWeWork() {
  return (
    <>
      <PageHero eyebrow="How we work" title={["A clear process,", "from call to running system."]} lead="You always know what happens next, what it costs and what you get at the end of each phase." />
      <section className="container-x pb-24 md:pb-32">
        {steps.map((s, i) => (
          <div key={s.num} className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-20">
            <p className="reveal text-[clamp(4rem,10vw,8rem)] font-semibold leading-none tracking-tight text-accent-strong md:col-span-3">{s.num}</p>
            <div className="md:col-span-4">
              <h2 className="h2 reveal">{s.title}</h2>
            </div>
            <div className="md:col-span-5">
              <p className="lead reveal">{s.text}</p>
              <div className="card reveal mt-8 p-6" style={{ ["--d" as string]: ".1s" }}>
                <p className="eyebrow mb-2">As a result, you get</p>
                <p className="h4">{s.result}</p>
              </div>
            </div>
            {i === 0 && <span className="sr-only">Phase list</span>}
          </div>
        ))}
        <div className="reveal flex flex-wrap gap-3 border-t border-line pt-12">
          <Btn href="/contact">Start with a free discovery call</Btn>
        </div>
      </section>
    </>
  );
}
