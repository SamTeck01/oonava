import type { Metadata } from "next";
import Link from "next/link";
import { realEstate, demos, tiers } from "@/lib/content";
import { PageHero, Btn, Split, More } from "@/components/Ui";
import Pipeline from "@/components/Pipeline";
import Calculator from "@/components/Calculator";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "AI automation for real estate agencies",
  description: "Reply to every property enquiry in seconds, follow up automatically and book more viewings, inside the tools you already use.",
};

export default function RealEstate() {
  return (
    <>
      <PageHero eyebrow="Solutions · Real estate" title={["Reply to every lead", "in seconds.", "Day and night."]} lead="Most buyers go with the agent who responds first. Oonava answers, qualifies and books viewings for you, then hands the lead to your agent at the right moment.">
        <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: ".3s" }}>
          <Btn href="/contact" variant="accent">Book a free consultation</Btn>
          <Btn href="/work/capture" variant="line">See how it works</Btn>
        </div>
      </PageHero>

      <section className="container-x grid gap-4 pb-16 md:grid-cols-3">
        {realEstate.stats.map((s, i) => (
          <div key={s.label} className="reveal border-t border-line pt-6" style={{ ["--d" as string]: `${i * 0.08}s` }}>
            <p className="text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-none tracking-tight">{s.value}</p>
            <p className="mt-3 text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <Split num="01" title="Where agencies lose deals" className="border-t border-line">
        <div className="grid gap-4 sm:grid-cols-2">
          {realEstate.pains.map((p, i) => (
            <div key={p.title} className="card reveal p-6 md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
              <p className="h4">{p.title}</p>
              <p className="mt-3 text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </Split>

      <section className="bg-fg py-24 text-bg md:py-32">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-bg opacity-60">02 · The lead engine</p>
            <h2 className="h2 reveal">From enquiry to booked viewing, automatically.</h2>
            <p className="lead reveal mt-6 opacity-70">Enquiries from Rightmove, Zoopla, your website and social all land in one system. Each one is read by AI, scored, logged in your CRM, answered personally and offered a viewing slot, in seconds.</p>
          </div>
          <div className="reveal text-fg"><Pipeline steps={demos[0].steps} title="Enquiry: 3-bed apartment, Manchester" source="Zoopla · 22:13, Saturday" /></div>
        </div>
      </section>

      <Split num="03" title="Then it keeps following up">
        <p className="lead reveal max-w-2xl text-muted">“I&apos;ll think about it” isn&apos;t a no. The Follow-Up Engine keeps every warm lead moving with useful, timed messages, and alerts your agent the moment they&apos;re ready.</p>
        <div className="reveal mt-8"><More href="/work/follow-up">Explore the Follow-Up Engine</More></div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["New", "38"], ["Nurturing", "51"], ["Re-engaged", "22"], ["Ready for agent", "13"]].map(([k, v], i) => (
            <div key={k} className="card reveal p-6" style={{ ["--d" as string]: `${i * 0.06}s` }}>
              <p className="text-4xl font-semibold tracking-tight">{v}</p>
              <p className="mt-2 text-sm text-muted">{k}</p>
            </div>
          ))}
        </div>
        <p className="reveal mt-4 text-sm text-muted">Sample pipeline from a concept demo.</p>
      </Split>

      <section className="section container-x border-t border-line">
        <p className="eyebrow reveal mb-4">04 · What slow replies cost</p>
        <h2 className="h2 reveal mb-14 max-w-3xl">Put your own numbers in.</h2>
        <div className="reveal"><Calculator /></div>
      </section>

      <Split num="05" title="Packages for agencies" className="border-t border-line">
        <div className="divide-y divide-line border-y border-line">
          {tiers.map((t) => (
            <div key={t.name} className="reveal flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between">
              <div><p className="h4">{t.name}</p><p className="text-muted">{t.lead}</p></div>
              <p className="font-semibold">{t.from ? "from " : ""}{t.setup} <span className="font-normal text-muted">+ {t.from ? "from " : ""}{t.monthly}/mo</span></p>
            </div>
          ))}
        </div>
        <div className="reveal mt-8"><More href="/pricing">Full pricing</More></div>
      </Split>

      <Split num="FAQ" title="Agency questions" className="border-t border-line">
        <Faq items={realEstate.faqs} />
      </Split>

      <section className="container-x pb-24">
        <div className="reveal rounded-[calc(var(--radius)*1.5)] bg-accent-strong px-6 py-16 text-white md:px-16 md:py-24">
          <h2 className="h2 max-w-3xl">Stop losing buyers to whoever answered first.</h2>
          <p className="lead mt-6 max-w-2xl opacity-90">Book a free 30-minute call. We&apos;ll map how enquiries reach you today and show you where they leak.</p>
          <Link href="/contact" className="btn mt-10 bg-white text-[#03030f] hover:bg-[#03030f] hover:text-white">Book a free consultation →</Link>
        </div>
      </section>
    </>
  );
}
