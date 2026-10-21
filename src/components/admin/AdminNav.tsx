"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/admin/actions";

const items = [
  { href: "/admin", label: "Today", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
  { href: "/admin/leads", label: "Pipeline", icon: "M4 6h16M4 12h10M4 18h6" },
  { href: "/admin/leads/new", label: "Add leads", icon: "M12 5v14M5 12h14" },
  { href: "/admin/clients", label: "Clients", icon: "M16 11a4 4 0 1 0-8 0M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" },
];

export default function AdminNav() {
  const path = usePathname();
  const active = (h: string) => (h === "/admin" ? path === "/admin" : h === "/admin/leads" ? path.startsWith("/admin/leads") && !path.startsWith("/admin/leads/new") : path.startsWith(h));
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-bg p-5 lg:flex">
        <Link href="/admin" className="px-2 text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></Link>
        <p className="px-2 text-xs text-muted">Admin</p>
        <nav className="mt-8 space-y-1">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${active(i.href) ? "bg-fg text-bg" : "hover:bg-surface"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.icon} /></svg>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 text-sm">
          <Link href="/" className="block rounded-xl px-3 py-2 text-muted hover:bg-surface">View website ↗</Link>
          <form action={logout}><button className="w-full rounded-xl px-3 py-2 text-left text-muted hover:bg-surface">Sign out</button></form>
        </div>
      </aside>
      <header className="flex items-center justify-between border-b border-line bg-bg px-4 py-3 lg:hidden">
        <Link href="/admin" className="text-xl font-bold tracking-tight">oonava<span className="text-accent">.</span></Link>
        <form action={logout}><button className="text-sm text-muted">Sign out</button></form>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Admin">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active(i.href) ? "text-accent-strong" : "text-muted"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.icon} /></svg>
            {i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
