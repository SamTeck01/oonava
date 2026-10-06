"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { services, demos } from "@/lib/content";
import { Arrow } from "./Ui";

const nav = [
  { href: "/services", label: "Services", mega: true },
  { href: "/solutions/real-estate", label: "Real Estate" },
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/about", label: "About" },
];

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };
  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-surface">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2.5a7.5 7.5 0 0 1 0 15z" fill="currentColor" />
      </svg>
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); setMega(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > 300 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ${hidden && !open && !mega ? "-translate-y-full" : ""}`}
      onMouseLeave={() => setMega(false)}
    >
      <div className={`border-b transition-colors duration-300 ${scrolled || mega ? "border-line bg-bg" : "border-transparent bg-transparent"}`}>
        <div className="container-x flex h-[72px] items-center justify-between md:h-20">
          <Link href="/" className="text-2xl font-bold tracking-tight" aria-label="Oonava home">
            oonava<span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onMouseEnter={() => setMega(!!n.mega)}
                onFocus={() => setMega(!!n.mega)}
                className={`rounded-full px-4 py-2 text-[.95rem] font-medium transition-colors hover:text-accent ${pathname.startsWith(n.href) ? "text-accent" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/estimate" className="btn btn-dark hidden min-h-11 sm:inline-flex">Estimate project</Link>
            <button
              className="grid h-11 w-11 place-items-center lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 top-0 h-[2px] w-6 bg-fg transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-[2px] w-6 bg-fg transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop mega menu */}
      <div className={`absolute inset-x-0 top-full hidden border-b border-line bg-bg transition-[opacity,transform] duration-300 lg:block ${mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
        <div className="container-x grid grid-cols-12 gap-8 py-12">
          <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-8">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group">
                <p className="eyebrow mb-1">{s.num}</p>
                <p className="h4 transition-colors group-hover:text-accent">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.pitch}</p>
              </Link>
            ))}
          </div>
          <div className="col-span-4 rounded-[var(--radius)] bg-surface p-7">
            <p className="eyebrow mb-4">Our work</p>
            <ul className="space-y-3">
              {demos.map((d) => (
                <li key={d.slug}>
                  <Link href={`/work/${d.slug}`} className="flex items-center justify-between font-semibold hover:text-accent">
                    {d.num} {d.name} <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-bg transition-[opacity,transform] duration-400 lg:hidden ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"}`}>
        <nav className="container-x flex flex-col pt-6 pb-10" aria-label="Mobile">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} className="border-b border-line py-4 text-3xl font-semibold tracking-tight" style={{ transition: "transform .5s", transitionDelay: `${i * 40}ms`, transform: open ? "none" : "translateY(12px)" }}>
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="border-b border-line py-4 text-3xl font-semibold tracking-tight">Contact</Link>
          <Link href="/estimate" className="btn btn-accent mt-8 w-full">Estimate project <Arrow /></Link>
          <a href="mailto:hello@oonava.com" className="mt-6 text-muted">hello@oonava.com</a>
        </nav>
      </div>
    </header>
  );
}
