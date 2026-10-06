import Link from "next/link";
import { pillars, demos, industries, toolNames, steps, tiers, trust, faqs } from "@/lib/content";
import { Btn, More, Split, Arrow } from "@/components/Ui";
import Pipeline from "@/components/Pipeline";
import Calculator from "@/components/Calculator";
import Faq from "@/components/Faq";

const manual = ["Lead arrives", "Someone checks the inbox", "Copies the details", "Updates the CRM", "Writes a reply", "Remembers to follow up", "Books the appointment", "Updates the spreadsheet"];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero container-x pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="h1">
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
            <p className="lead reveal mt-8 max-w-xl text-muted" style={{ ["--d" as string]: ".35s" }}>
              Turn more enquiries into appointments without adding another person to your team. Oonava removes repetitive work, connects the tools you already use and builds what&apos;s missing.
            </p>
            <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: ".45s" }}>
              <Btn href="/work">See Oonava in action</Btn>
              <Btn href="/contact" variant="line">Book a consultation</Btn>
            </div>
          </div>
          <div className="reveal relative lg:col-span-5" style={{ ["--d" as string]: ".3s" }}>
            <Pipeline steps={demos[0].steps} title="New enquiry: 3-bed apartment" source="Rightmove · 21:47, Sunday" />
            <Link href="/work" className="group absolute -bottom-10 -left-6 hidden h-28 w-28 place-items-center md:grid" aria-label="Explore concept demos">
              <svg viewBox="0 0 120 120" className="spin absolute inset-0 text-fg" aria-hidden>
                <defs><path id="badge" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
                <text fontSize="11.5" fontWeight="600" letterSpacing="2.4" fill="currentColor"><textPath href="#badge">SEE IT IN ACTION • SEE IT IN ACTION •</textPath></text>
              </svg>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-strong text-white transition-transform duration-500 group-hover:scale-110"><Arrow /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section container-x pt-0 md:pt-0">
        <p className="eyebrow reveal mb-6">What we do</p>
        <div className="grid gap-10 md:grid-cols-12">
          <p className="h3 reveal md:col-span-7">Oonava is an AI automation and software company. We help businesses remove repetitive work, connect disconnected systems and build the software they need to operate better.</p>
          <div className="reveal space-y-4 text-muted md:col-span-4 md:col-start-9" style={{ ["--d" as string]: ".1s" }}>
            <p>We start with your process, not a tool. Then we automate what should run on its own and keep people where judgement matters.</p>
            <p>Real estate is our first focus. The same systems work for any business that runs on enquiries, bookings and admin.</p>
            <More href="/about">About Oonava</More>
          </div>
        </div>
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            ["Reply to every enquiry in seconds", "and stop losing deals to whoever answered first."],
            ["Automate the internal processes", "that quietly eat hours of your team's week."],
            ["Build the missing system", "when your existing tools can't do what you need."],
          ].map(([a, b], i) => (
            <div key={a} className="reveal border-t border-line pt-6" style={{ ["--d" as string]: `${i * 0.08}s` }}>
              <p className="eyebrow mb-3">0{i + 1}</p>
              <p className="h4">{a}</p>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-fg py-24 text-bg md:py-36">
        <div className="container-x">
          <h2 className="h2 reveal max-w-4xl">You&apos;re paying for the lead. <span className="opacity-50">Why are you still paying someone to move it between systems?</span></h2>
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="reveal rounded-[var(--radius)] border border-white/10 p-6 md:p-10">
              <p className="mb-6 text-sm uppercase tracking-widest opacity-60">Today: by hand</p>
              <ol className="space-y-3">
                {manual.map((m, i) => (
                  <li key={m} className="flex items-center gap-4 opacity-70">
                    <span className="w-6 text-sm tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>{m}
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-sm opacity-60">Hours later, if nobody is on holiday.</p>
            </div>
            <div className="reveal rounded-[var(--radius)] bg-accent-strong p-6 text-white md:p-10" style={{ ["--d" as string]: ".12s" }}>
              <p className="mb-6 text-sm uppercase tracking-widest opacity-80">With Oonava</p>
              <p className="h3">Enquiry in. Qualified, logged, answered and booked. Your team steps in when there&apos;s a real conversation to have.</p>
              <p className="mt-8 text-[clamp(3rem,7vw,5rem)] font-semibold leading-none tracking-tight">&lt; 60s</p>
              <p className="mt-2 opacity-80">target response time, day and night</p>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      {pillars.map((s) => (
        <Split key={s.slug} num={s.num} title={s.title} className="border-b border-line">
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

      {/* CONCEPT DEMOS */}
      <section className="section container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow reveal mb-4">See the system in action</p>
            <h2 className="h2 reveal max-w-3xl">Three money problems. Three systems.</h2>
          </div>
          <div className="reveal"><More href="/work">All concept demos</More></div>
        </div>
        <div className="mt-16 space-y-4">
          {demos.map((d, i) => (
            <Link key={d.slug} href={`/work/${d.slug}`} className="card card-hover reveal group grid items-center gap-8 p-6 md:p-10 lg:grid-cols-12" style={{ ["--d" as string]: `${i * 0.05}s` }}>
              <div className="lg:col-span-5">
                <p className="eyebrow mb-3">{d.num} · Concept</p>
                <p className="h2">{d.title}</p>
                <p className="lead mt-4 text-muted">{d.line}</p>
                <p className="mt-6 text-sm text-muted">The problem: “{d.problem}”</p>
                <span className="more mt-8"><span className="dot"><Arrow /></span>Explore {d.name}</span>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <Pipeline steps={d.steps} title={d.name} source="Concept preview" interval={700} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* KEEP YOUR TOOLS */}
      <section className="section overflow-hidden border-y border-line">
        <div className="container-x grid gap-10 md:grid-cols-12">
          <h2 className="h2 reveal md:col-span-6">Keep the tools that work. <span className="text-muted">We&apos;ll connect the gaps.</span></h2>
          <p className="lead reveal text-muted md:col-span-5 md:col-start-8">Oonava doesn&apos;t ask you to throw everything away. We work with your CRM, inbox, calendar and portals, and build a connection where none exists.</p>
        </div>
        <div className="mt-16 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="marquee gap-3">
            {[...toolNames, ...toolNames].map((t, i) => (
              <span key={i} className="mr-3 inline-flex h-14 items-center rounded-full border border-line px-6 text-lg font-semibold whitespace-nowrap">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* COST CALCULATOR */}
      <section className="section container-x">
        <p className="eyebrow reveal mb-4">What it costs you</p>
        <h2 className="h2 reveal mb-14 max-w-3xl">The expensive part isn&apos;t automation. It&apos;s doing nothing.</h2>
        <div className="reveal"><Calculator /></div>
      </section>

      {/* INDUSTRIES */}
      <Split num="Expertise" title="Built around your business">
        <div className="grid gap-4">
          {industries.map((ind, i) => (
            <Link key={ind.title} href={ind.href} className="reveal group flex items-center justify-between gap-6 border-b border-line py-8" style={{ ["--d" as string]: `${i * 0.06}s` }}>
              <div>
                <p className="h3 transition-colors group-hover:text-accent">{ind.title}</p>
                <p className="mt-2 text-muted">{ind.text}</p>
              </div>
              <span className="more shrink-0"><span className="dot"><Arrow /></span></span>
            </Link>
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
            <h2 className="h2 reveal max-w-3xl">Choose how much of the workflow you want Oonava to own.</h2>
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
        <p className="reveal mt-8 text-muted">Not sure what you need? <Link href="/estimate" className="font-semibold text-fg underline decoration-accent underline-offset-4">Estimate your automation</Link> in under a minute.</p>
      </section>

      {/* TRUST */}
      <Split num="Trust & data" title="Your data, handled responsibly" className="border-t border-line">
        <p className="lead reveal mb-12 max-w-2xl text-muted">We work with customer information, inboxes and CRMs, so we build with UK GDPR principles from the first line, not as an afterthought.</p>
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
          <h2 className="h2 max-w-3xl">Find the bottleneck costing your business time.</h2>
          <p className="lead mt-6 max-w-2xl opacity-90">We&apos;ll map the process, identify what can be automated and show you what Oonava could take off your team&apos;s plate.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contact" className="btn bg-white text-[#03030f] hover:bg-[#03030f] hover:text-white">Book a consultation <Arrow /></Link>
            <Link href="/estimate" className="btn border border-white/40 hover:border-white">Estimate your automation <Arrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
