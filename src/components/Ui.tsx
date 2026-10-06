import Link from "next/link";
import type { ReactNode } from "react";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`arrow ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function More({ href, children = "View more" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="more">
      <span className="dot"><Arrow /></span>
      {children}
    </Link>
  );
}

export function Btn({ href, children, variant = "dark", className = "" }: { href: string; children: ReactNode; variant?: "dark" | "accent" | "line"; className?: string }) {
  return (
    <Link href={href} className={`btn btn-${variant} ${className}`}>
      {children} <Arrow />
    </Link>
  );
}

// Ronas-style split: number + title on the left, content on the right.
export function Split({ num, title, children, id, className = "" }: { num?: string; title: ReactNode; children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`section container-x ${className}`}>
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            {num && <p className="eyebrow reveal mb-4">{num}</p>}
            <h2 className="h2 reveal">{title}</h2>
          </div>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export function Lines({ lines, className = "", as: Tag = "h1" }: { lines: ReactNode[]; className?: string; as?: "h1" | "h2" }) {
  return (
    <Tag className={className} data-reveal>
      {lines.map((l, i) => (
        <span className="line-mask" key={i}>
          <span style={{ ["--d" as string]: `${i * 0.09}s` }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode[]; lead?: string; children?: ReactNode }) {
  return (
    <section className="hero container-x pt-36 pb-16 md:pt-48 md:pb-24">
      <p className="eyebrow reveal mb-6">{eyebrow}</p>
      <Lines lines={title} className="h1 max-w-[16ch]" />
      {lead && <p className="lead reveal mt-8 max-w-2xl text-muted" style={{ ["--d" as string]: ".2s" }}>{lead}</p>}
      {children}
    </section>
  );
}
