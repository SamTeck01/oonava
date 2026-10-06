import Link from "next/link";
import { pillars, demos, industries, tech, steps, tiers, trust, faqs } from "@/lib/content";
import { Btn, More, Split, Arrow } from "@/components/Ui";
import Showcase from "@/components/Showcase";
import DemoVisual from "@/components/DemoVisual";
import Faq from "@/components/Faq";

const needs = [
  ["Automate the internal processes", "of your business, so your team stops doing work a system can do better."],
  ["Connect the tools you already use", "so your CRM, inbox, calendar and data finally work as one system."],
  ["Build custom software and AI", "when off-the-shelf tools can't do what your business needs."],
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero container-x pt-32 md:pt-44">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <h1 className="h1 lg:col-span-8">
            {["Automate.", "Integrate.", null].map((w, i) => (
              <span className="line-mask" key={i}>
                <span style={{ ["--d" as string]: `${i * 0.1}s` }}>
                  {w ?? (
                    <span className="squiggle">
                      Build.
                      <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden><path d="M3 14 C 50 3, 80 19, 130 10 S 210 3, 250 12 S 290 15, 297 7" /></svg>
                    </span>
                  )}
                </span>
              </span>
            ))}
          </h1>
          <div className="lg:col-span-4 lg:pb-3">
            <p className="lead reveal text-muted" style={{ ["--d" as string]: ".35s" }}>
              Oonava is an AI automation agency. We design, build and maintain automation, integrations and custom software for growing businesses.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: ".45s" }}>
              <Btn href="/estimate">Estimate project</Btn>
              <Btn href="/work" variant="line">Our work</Btn>
            </div>
          </div>
        </div>
        <div className="reveal relative mt-14 md:mt-20" style={{ ["--d" as string]: ".5s" }}>
          <Showcase />
          <Link href="/work" className="group absolute -top-12 right-4 hidden h-28 w-28 place-items-center md:grid lg:-top-14 lg:right-10" aria-label="Explore our work">
            <svg viewBox="0 0 120 120" className="spin absolute inset-0 text-fg" aria-hidden>
              <defs><path id="badge" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text fontSize="11.5" fontWeight="600" letterSpacing="2.4" fill="currentColor"><textPath href="#badge">SEE OUR WORK • SEE OUR WORK • </textPath></text>
            </svg>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-strong text-white transition-transform duration-500 group-hover:scale-110"><Arrow /></span>
          </Link>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section container-x">
        <p className="eyebrow reveal mb-6">What we do</p>
        <div className="grid gap-10 md:grid-cols-12">
          <p className="h3 reveal md:col-span-7">Oonava is an AI automation and software agency helping businesses remove repetitive work, connect disconnected systems and build the software they need to operate better.</p>
          <div className="reveal space-y-4 text-muted md:col-span-4 md:col-start-9" style={{ ["--d" as string]: ".1s" }}>
            <p>We start with your process, not a tool. Then we design the system, build it properly and stay on to maintain it.</p>
            <p>A small senior team: automation specialists and software engineers who ship production systems.</p>
            <More href="/about">About Oonava</More>
          </div>
        </div>
        <div className="mt-24 grid gap-10 md:grid-cols-12">
          <p className="h4 reveal md:col-span-4">You may need our services if you want to:</p>
          <div className="space-y-10 md:col-span-7 md:col-start-6">
            {needs.map(([a, b], i) => (
              <div key={a} className="reveal flex gap-6" style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold text-accent-strong">0{i + 1}</span>
                <p className="h3">{a} <span className="text-muted">{b}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      {pillars.map((s) => (
        <Split key={s.slug} num={s.num} title={s.title} className="border-t border-line">
          <p className="lead reveal max-w-2xl">{s.pitch} <span className="text-muted">{s.intro.split(". ")[0]}.</span></p>
          <div className="reveal mt-8"><More href={`/services/${s.slug}`} /></div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {s.items.map((it, i) => (
              <Link key={it.title} href={`/services/${s.slug}`} className="card card-hover reveal flex min-h-[190px] flex-col justify-between p-6 md:min-h-[280px] md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
                <p className="h4">{it.title}</p>
                <p className="mt-6 text-[.95rem] text-muted">{it.text}</p>
              </Link>
            ))}
          </div>
        </Split>
      ))}

      {/* SELECTED WORK */}
      <section className="section bg-fg text-bg">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow reveal mb-4 !text-bg opacity-60">Selected work</p>
              <h2 className="h2 reveal max-w-3xl">Systems we design and build</h2>
              <p className="lead reveal mt-6 max-w-2xl opacity-70">Concept systems showing how we approach real business problems, from the first enquiry to the work behind the scenes.</p>
            </div>
          </div>
          <div className="mt-20 space-y-24 md:space-y-36">
            {demos.map((d, i) => (
              <article key={d.slug} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                <div className={`reveal lg:col-span-5 ${i % 2 ? "lg:order-2 lg:col-start-8" : ""}`}>
                  <p className="text-sm opacity-60">{d.num} · Concept · {d.sector}</p>
                  <h3 className="h2 mt-4">{d.name}</h3>
                  <p className="lead mt-4 opacity-70">{d.line}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {d.tags.map((t) => <li key={t} className="rounded-full border border-white/20 px-3 py-1 text-sm">{t}</li>)}
                  </ul>
                  <Link href={`/work/${d.slug}`} className="more mt-10"><span className="dot !border-white/25"><Arrow /></span>View case</Link>
                </div>
                <div className={`reveal text-fg lg:col-span-7 ${i % 2 ? "lg:order-1" : ""}`} style={{ ["--d" as string]: ".1s" }}>
                  <DemoVisual kind={d.slug} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <Split num="Expertise" title="Industries we work with">
        <div className="grid gap-4 sm:grid-cols-2">
          {industries.map((ind, i) => (
            <Link key={ind.title} href={ind.href} className="card card-hover reveal group flex min-h-[200px] flex-col justify-between p-6 md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
              <div className="flex items-start justify-between gap-4">
                <p className="h4 transition-colors group-hover:text-accent-strong">{ind.title}</p>
                {ind.live && <span className="rounded-full bg-accent-strong px-3 py-1 text-xs font-semibold text-white">Focus</span>}
              </div>
              <p className="mt-6 text-muted">{ind.text}</p>
            </Link>
          ))}
        </div>
      </Split>

      {/* TECHNOLOGIES */}
      <Split num="Technologies" title="Our stack" className="border-t border-line">
        <div className="divide-y divide-line border-y border-line">
          {tech.map((g, i) => (
            <div key={g.group} className="reveal grid gap-4 py-7 md:grid-cols-12" style={{ ["--d" as string]: `${i * 0.05}s` }}>
              <p className="font-semibold md:col-span-3">{g.group}</p>
              <div className="flex flex-wrap gap-2 md:col-span-9">
                {g.items.map((t) => <span key={t} className="rounded-full bg-surface px-4 py-2 text-[.95rem]">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Split>

      {/* PROCESS */}
      <section className="section bg-surface">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="h2 reveal">How we work</h2>
            <div className="reveal"><More href="/how-we-work">Our approach</More></div>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius)] bg-line md:grid-cols-5">
            {steps.map((s, i) => (
              <div key={s.num} className="reveal bg-bg p-6 md:p-7" style={{ ["--d" as string]: `${i * 0.06}s` }}>
                <p className="text-5xl font-semibold tracking-tight text-accent-strong">{s.num}</p>
                <p className="h4 mt-8">{s.title}</p>
                <p className="mt-3 text-[.95rem] text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="section container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow reveal mb-4">Pricing</p>
            <h2 className="h2 reveal max-w-3xl">Three ways to work with us.</h2>
          </div>
          <div className="reveal"><More href="/pricing">Full pricing</More></div>
        </div>
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <div key={t.name} className={`reveal flex flex-col rounded-[var(--radius)] p-7 md:p-9 ${t.featured ? "bg-fg text-bg" : "card"}`} style={{ ["--d" as string]: `${i * 0.08}s` }}>
              <p className={`text-sm ${t.featured ? "opacity-60" : "text-muted"}`}>0{i + 1} · {t.level}</p>
              <p className="h3 mt-3">{t.name}</p>
              <p className={`mt-3 ${t.featured ? "opacity-70" : "text-muted"}`}>{t.lead}</p>
              <p className="mt-10 text-4xl font-semibold tracking-tight">{t.from && <span className="text-lg font-medium">from </span>}{t.setup}</p>
              <p className={`text-sm ${t.featured ? "opacity-60" : "text-muted"}`}>setup, then {t.from ? "from " : ""}{t.monthly}/month</p>
            </div>
          ))}
        </div>
        <p className="reveal mt-8 text-muted">Not sure what you need? <Link href="/estimate" className="font-semibold text-fg underline decoration-accent underline-offset-4">Estimate your project</Link> in under a minute.</p>
      </section>

      {/* TRUST */}
      <Split num="Security" title="How we handle your data" className="border-t border-line">
        <p className="lead reveal mb-12 max-w-2xl text-muted">We work with customer information, inboxes and business systems, so we build with UK GDPR principles from the first line, not as an afterthought.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {trust.map((t, i) => (
            <div key={t.title} className="card reveal p-6 md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
              <p className="h4">{t.title}</p>
              <p className="mt-3 text-muted">{t.text}</p>
            </div>
          ))}
        </div>
      </Split>

      {/* FAQ */}
      <Split num="Questions" title="FAQ">
        <Faq items={faqs} />
      </Split>

      {/* FINAL CTA */}
      <section className="container-x pb-24 md:pb-32">
        <div className="reveal relative overflow-hidden rounded-[calc(var(--radius)*1.5)] bg-accent-strong px-6 py-16 text-white md:px-16 md:py-24">
          <h2 className="h2 max-w-3xl">Have a process that should run itself?</h2>
          <p className="lead mt-6 max-w-2xl opacity-90">Tell us about it. We&apos;ll map it with you, show what can be automated or built, and give you a fixed price.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/estimate" className="btn bg-white text-[#03030f] hover:bg-[#03030f] hover:text-white">Estimate project <Arrow /></Link>
            <Link href="/contact" className="btn border border-white/40 hover:border-white">Book a consultation <Arrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
