"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/admin/actions";

type Perm = string;
const ICON = {
  today: "M3 12l9-8 9 8M5 10v10h14V10",
  outreach: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  pipeline: "M4 6h16M4 12h10M4 18h6",
  add: "M12 5v14M5 12h14",
  projects: "M3 7h18v13H3zM8 7V4h8v3",
  tasks: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
  clients: "M16 11a4 4 0 1 0-8 0M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5",
  invoices: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6",
  team: "M17 20c0-2.8-2.2-5-5-5s-5 2.2-5 5M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20c0-2.2-1.3-4-3.2-4.7M17 4.3a4 4 0 0 1 0 7.4",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  account: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};

const ALL: { href: string; label: string; icon: keyof typeof ICON; perms: Perm[] | null; primary?: boolean }[] = [
  { href: "/admin", label: "Today", icon: "today", perms: null, primary: true },
  { href: "/admin/outreach", label: "Outreach", icon: "outreach", perms: ["outreach", "sales"], primary: true },
  { href: "/admin/leads", label: "Pipeline", icon: "pipeline", perms: ["sales", "outreach", "marketing"], primary: true },
  { href: "/admin/leads/new", label: "Add leads", icon: "add", perms: ["sales", "outreach", "marketing"] },
  { href: "/admin/projects", label: "Projects", icon: "projects", perms: ["delivery"], primary: true },
  { href: "/admin/tasks", label: "Tasks", icon: "tasks", perms: null, primary: true },
  { href: "/admin/clients", label: "Clients", icon: "clients", perms: ["sales", "finance"] },
  { href: "/admin/invoices", label: "Invoices", icon: "invoices", perms: ["finance"] },
  { href: "/admin/team", label: "Team", icon: "team", perms: ["admin"] },
  { href: "/admin/connections", label: "Connections", icon: "link", perms: ["admin"] },
  { href: "/admin/account", label: "My account", icon: "account", perms: null },
];

function Icon({ d }: { d: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

export default function AdminNav({ user }: { user: { name: string; title: string; permissions: string[] } }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const has = (p: Perm[] | null) => !p || user.permissions.includes("admin") || p.some((x) => user.permissions.includes(x));
  const items = ALL.filter((i) => has(i.perms));
  const active = (h: string) => (h === "/admin" ? path === "/admin" : h === "/admin/leads" ? path.startsWith("/admin/leads") && !path.startsWith("/admin/leads/new") : path.startsWith(h));
  const bottom = items.filter((i) => i.primary).slice(0, 4);
  const rest = items.filter((i) => !bottom.includes(i));

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-bg p-5 lg:flex">
        <Link href="/admin" className="px-2 text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></Link>
        <p className="px-2 text-xs text-muted">{user.name} · {user.title || "Team"}</p>
        <nav className="mt-8 space-y-1 overflow-y-auto" aria-label="Admin">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${active(i.href) ? "bg-fg text-bg" : "hover:bg-surface"}`}>
              <Icon d={ICON[i.icon]} />{i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 pt-4 text-sm">
          <Link href="/" className="block rounded-xl px-3 py-2 text-muted hover:bg-surface">View website ↗</Link>
          <form action={logout}><button className="w-full rounded-xl px-3 py-2 text-left text-muted hover:bg-surface">Sign out</button></form>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-bg px-4 py-3 lg:hidden">
        <Link href="/admin" className="text-xl font-bold tracking-tight">oonava<span className="text-accent">.</span></Link>
        <span className="text-sm text-muted">{user.name}</span>
      </header>

      {more && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-bg p-4 pb-24" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-3 gap-2">
              {rest.map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setMore(false)} className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold ${active(i.href) ? "bg-fg text-bg" : "bg-surface"}`}>
                  <Icon d={ICON[i.icon]} />{i.label}
                </Link>
              ))}
              <form action={logout} className="contents"><button className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-surface text-xs font-semibold">Sign out</button></form>
            </div>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden" style={{ gridTemplateColumns: `repeat(${bottom.length + 1}, minmax(0, 1fr))` }} aria-label="Admin">
        {bottom.map((i) => (
          <Link key={i.href} href={i.href} onClick={() => setMore(false)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active(i.href) ? "text-accent-strong" : "text-muted"}`}>
            <Icon d={ICON[i.icon]} />{i.label}
          </Link>
        ))}
        <button onClick={() => setMore((m) => !m)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${more ? "text-accent-strong" : "text-muted"}`} aria-expanded={more}>
          <Icon d="M4 6h16M4 12h16M4 18h16" />More
        </button>
      </nav>
    </>
  );
}
