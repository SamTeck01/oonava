import type { Metadata } from "next";
import Link from "next/link";
import { tiers, faqs } from "@/lib/content";
import { PageHero, Btn, Split, Arrow } from "@/components/Ui";
import Faq from "@/components/Faq";

export const metadata: Metadata = { title: "Pricing", description: "Essential Automation from €1,500, Connected Automation + AI from €4,500, Custom Systems from €10,000." };

export default function Pricing() {
  const priceFaqs = faqs.filter((f) => /cost|long|after launch|custom/i.test(f.q));
  return (
    <>
      <PageHero eyebrow="Pricing" title={["Clear prices.", "No surprises."]} lead="Choose how much of the workflow you want Oonava to own. Every package has a one-off setup fee and a monthly plan that keeps it monitored, maintained and improving." />
      <section className="container-x pb-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => {
            const dark = t.featured;
            return (
              <div key={t.name} className={`reveal relative flex flex-col rounded-[var(--radius)] p-7 md:p-9 ${dark ? "bg-fg text-bg" : "card"}`} style={{ ["--d" as string]: `${i * 0.08}s` }}>
                {dark && <span className="absolute right-6 top-6 rounded-full bg-accent-strong px-3 py-1 text-xs font-semibold text-white">Recommended</span>}
                <p className={`text-sm ${dark ? "opacity-60" : "text-muted"}`}>0{i + 1} · {t.level}</p>
                <p className="h3 mt-3 pr-24">{t.name}</p>
                <p className={`mt-3 ${dark ? "opacity-70" : "text-muted"}`}>{t.lead} {t.for}</p>
                <div className="mt-10">
                  <p className="text-5xl font-semibold tracking-tight">{t.from && <span className="text-lg font-medium">from </span>}{t.setup}</p>
                  <p className={`mt-1 ${dark ? "opacity-60" : "text-muted"}`}>one-off setup</p>
                  <p className="mt-5 text-2xl font-semibold">{t.from && <span className="text-base font-medium">from </span>}{t.monthly}<span className="text-base font-medium">/month</span></p>
                  <p className={`mt-1 ${dark ? "opacity-60" : "text-muted"}`}>monitoring, maintenance &amp; improvements</p>
                </div>
                <ul className={`mt-10 flex-1 space-y-3 border-t pt-8 ${dark ? "border-white/15" : "border-line"}`}>
                  {t.features.map((f) => <li key={f} className="flex gap-3"><span className="text-accent-strong" aria-hidden>✓</span>{f}</li>)}
                </ul>
                <p className={`mt-8 text-sm ${dark ? "opacity-60" : "text-muted"}`}>{t.examples}</p>
                <Link href="/contact" className={`btn mt-8 w-full ${dark ? "btn-accent" : "btn-dark"}`}>Book a consultation <Arrow /></Link>
              </div>
            );
          })}
        </div>
        <p className="reveal mt-8 text-sm text-muted">Prices exclude VAT and third-party subscriptions (for example AI usage, CRM or automation platform plans), which are billed at cost to your own accounts.</p>
      </section>

      <section className="container-x pb-8">
        <div className="card reveal flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="h3">Not sure what you need?</p>
            <p className="mt-2 text-muted">Answer five quick questions and we&apos;ll point you to the right package.</p>
          </div>
          <Btn href="/estimate">Estimate project</Btn>
        </div>
      </section>

      <Split num="FAQ" title="Pricing questions">
        <Faq items={priceFaqs} />
      </Split>
    </>
  );
}
