import type { Metadata } from "next";
import { site } from "@/lib/content";
import { PageHero } from "@/components/Ui";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Book a consultation", description: "Book a free consultation with Oonava." };

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title={["Interested?", "Let's talk."]} lead="A free 30-minute call. We map how work flows through your business today and show you what could run on its own. You leave with a plan, whether you work with us or not." />
      <section className="container-x grid gap-16 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="reveal lg:col-span-7">
          {site.calendlyUrl ? (
            <iframe src={site.calendlyUrl} title="Book a consultation" className="h-[720px] w-full rounded-[var(--radius)] border border-line" loading="lazy" />
          ) : (
            <ContactForm />
          )}
        </div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div className="reveal"><p className="eyebrow mb-2">Write to us</p><a href={`mailto:${site.email}`} className="h4 hover:text-accent">{site.email}</a></div>
          <div className="reveal"><p className="eyebrow mb-2">Response time</p><p className="h4">Within one working day</p></div>
          <div className="reveal">
            <p className="eyebrow mb-4">What happens next</p>
            <ol className="space-y-3">
              {["We reply and book a time that suits you", "30-minute call to map your process", "You get a written plan and fixed price"].map((s, i) => (
                <li key={s} className="flex gap-4"><span className="font-semibold text-accent-strong">0{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
