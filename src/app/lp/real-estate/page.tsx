import type { Metadata } from "next";
import Link from "next/link";
import { realEstate, tiers } from "@/lib/content";
import { Money, CurrencyToggle } from "@/components/Money";
import LiveDemo from "@/components/LiveDemo";
import Calculator from "@/components/Calculator";
import ContactForm from "@/components/ContactForm";
import Faq from "@/components/Faq";
import { ThemeToggle } from "@/components/Header";

// Paid-ad landing page: no navigation, one action (book a call), message matched to the real estate ads.
export const metadata: Metadata = {
  title: "Reply to every property enquiry in seconds",
  description: "Try it yourself: send an enquiry and watch AI qualify it and reply in seconds. Oonava automates lead replies, follow-up and viewing bookings for estate agents.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/solutions/real-estate" },
};

const faqs = [
  { q: "Do we need to change our CRM or portals?", a: "No. We connect to the tools you already use, including Rightmove, Zoopla, your website and most property CRMs." },
  { q: "How long until it's live?", a: "Usually 2–4 weeks for a connected lead system, depending on your tools. We start with a free 30-minute mapping call." },
  { q: "Will replies sound robotic?", a: "No. Each reply is written for that enquiry in your agency's tone, and anything unusual is handed to a human agent." },
  { q: "Is our data safe?", a: "We build with data privacy and GDPR principles in mind: least-access permissions, data kept in your accounts, and nothing used to train AI models." },
  ...realEstate.faqs.slice(2),
];

export default function Landing() {
  return (
    <>
      <div className="container-x flex items-center justify-between py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight">oonava</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="#book" className="btn btn-dark !py-2">Book a call</a>
        </div>
      </div>

      <section className="container-x grid items-center gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow reveal mb-5">For estate & letting agents</p>
          <h1 className="h1 reveal">Reply to every enquiry in seconds. Even at 10pm on a Saturday.</h1>
          <p className="lead reveal mt-6 max-w-xl text-muted">Most buyers go with the agent who replies first. Oonava answers, qualifies and offers viewings automatically, inside the tools you already use.</p>
          <div className="reveal mt-10 flex flex-wrap gap-3">
            <a href="#demo" className="btn btn-accent">Try the live demo ↓</a>
            <a href="#book" className="btn btn-line">Book a free call</a>
          </div>
        </div>
        <div className="reveal grid gap-4 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
          {realEstate.stats.map((s) => (
            <div key={s.label} className="border-t border-line pt-4">
              <p className="text-4xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container-x border-t border-line">
        <p className="eyebrow reveal mb-4">01 · Sound familiar?</p>
        <h2 className="h2 reveal mb-12 max-w-3xl">Where agencies lose deals every week.</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {realEstate.pains.map((p) => (
            <div key={p.title} className="card reveal p-6"><p className="h4">{p.title}</p><p className="mt-3 text-muted">{p.text}</p></div>
          ))}
        </div>
      </section>

      <section id="demo" className="section container-x scroll-mt-8 border-t border-line">
        <p className="eyebrow reveal mb-4">02 · Don&apos;t take our word for it</p>
        <h2 className="h2 reveal mb-4 max-w-3xl">Send an enquiry. Watch what happens.</h2>
        <p className="lead reveal mb-12 max-w-2xl text-muted">This is the same system we build for agencies: the AI reads your enquiry, qualifies it and emails you a personal reply with viewing slots.</p>
        <div className="reveal"><LiveDemo /></div>
      </section>

      <section className="section container-x border-t border-line">
        <p className="eyebrow reveal mb-4">03 · What slow replies cost you</p>
        <h2 className="h2 reveal mb-12 max-w-3xl">Put your own numbers in.</h2>
        <div className="reveal"><Calculator cta={{ href: "#book", label: "Get this fixed: book a free call" }} /></div>
      </section>

      <section className="section container-x border-t border-line">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow reveal mb-4">04 · Clear pricing</p>
            <h2 className="h2 reveal max-w-3xl">One setup fee. One monthly fee. No surprises.</h2>
          </div>
          <CurrencyToggle />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`card reveal flex flex-col p-6 md:p-8 ${t.featured ? "ring-2 ring-accent" : ""}`}>
              {t.featured && <p className="eyebrow mb-3 !text-accent">Most agencies choose this</p>}
              <p className="h4">{t.name}</p>
              <p className="mt-2 text-muted">{t.lead}</p>
              <p className="mt-6 text-3xl font-semibold tracking-tight">{t.from ? "from " : ""}<Money price={t.setup} /></p>
              <p className="text-sm text-muted">setup + {t.from ? "from " : ""}<Money price={t.monthly} />/month</p>
              <ul className="mt-6 flex-1 list-disc space-y-1 pl-5 text-sm text-muted">{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section container-x border-t border-line">
        <p className="eyebrow reveal mb-4">05 · Questions</p>
        <h2 className="h2 reveal mb-12">Before you book.</h2>
        <Faq items={faqs} />
      </section>

      <section id="book" className="container-x scroll-mt-8 pb-16">
        <div className="reveal grid gap-10 rounded-[calc(var(--radius)*1.5)] bg-accent-strong px-6 py-14 text-white md:px-14 md:py-20 lg:grid-cols-2">
          <div>
            <h2 className="h2">Stop losing buyers to whoever answered first.</h2>
            <p className="lead mt-6 opacity-90">Book a free 30-minute call. We&apos;ll map how enquiries reach you today, show you where they leak and tell you honestly what&apos;s worth automating.</p>
            <ul className="mt-8 space-y-2 opacity-90"><li>✓ No obligation</li><li>✓ Reply within one working day</li><li>✓ Works with your current tools</li></ul>
          </div>
          <div className="rounded-[var(--radius)] bg-bg p-6 text-fg md:p-8"><ContactForm context="Ad landing page: real estate" compact /></div>
        </div>
        <p className="mt-10 text-center text-sm text-muted">© Oonava · <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link></p>
      </section>
    </>
  );
}
