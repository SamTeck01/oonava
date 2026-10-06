import Link from "next/link";
import { services, demos, site } from "@/lib/content";
import { Btn } from "./Ui";

export default function Footer() {
  const cols = [
    { title: "Services", links: services.map((s) => ({ href: `/services/${s.slug}`, label: `${s.title}: ${s.short}` })) },
    { title: "Solutions", links: [{ href: "/solutions/real-estate", label: "Real estate" }, { href: "/estimate", label: "Estimate project" }, { href: "/pricing", label: "Pricing" }] },
    { title: "Work", links: demos.map((d) => ({ href: `/work/${d.slug}`, label: d.name })) },
    { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/how-we-work", label: "How we work" }, { href: "/contact", label: "Contact" }] },
  ];
  return (
    <footer className="border-t border-line">
      <div className="container-x pt-24 pb-10 md:pt-32">
        <p className="eyebrow reveal mb-4">Contacts</p>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="reveal text-[clamp(3rem,10vw,8rem)] font-semibold leading-[.95] tracking-[-0.04em]">Get in touch</h2>
          <div className="reveal flex flex-wrap gap-3">
            <Btn href="/contact">Book a consultation</Btn>
            <Btn href="/estimate" variant="line">Estimate project</Btn>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-5 font-semibold">{c.title}</p>
              <ul className="space-y-3 text-[.95rem] text-muted">
                {c.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="transition-colors hover:text-fg">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          <div><p className="eyebrow mb-2">Write</p><a href={`mailto:${site.email}`} className="text-lg font-semibold hover:text-accent">{site.email}</a></div>
          <div><p className="eyebrow mb-2">Based in</p><p className="text-lg font-semibold">United Kingdom · Remote across Europe</p></div>
          <div><p className="eyebrow mb-2">Approach</p><p className="text-lg font-semibold">{site.tagline}</p></div>
        </div>

        <div className="mt-16 flex flex-col gap-4 text-sm text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Oonava. AI automation &amp; custom systems.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-fg">Privacy policy</Link>
            <Link href="/terms" className="hover:text-fg">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
