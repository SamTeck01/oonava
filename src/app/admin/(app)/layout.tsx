import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/admin/auth";
import { teamDbEnabled } from "@/lib/admin/db";
import { isDemo, leadsConnected } from "@/lib/admin/store";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import { can } from "@/lib/admin/team";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Oonava admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const u = await requireUser();
  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <AdminNav user={{ name: u.name, title: u.title, permissions: u.permissions }} />
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        {(!teamDbEnabled() || isDemo()) && (
          <div className="bg-[#fff2d6] px-4 py-2 text-center text-sm text-[#7a4b00]">
            Items tagged <b>SAMPLE</b> are mock data for testing, not real. Changes to them aren&apos;t saved permanently.
            {can(u, "admin") && <Link href="/admin/connections" className="ml-2 inline-flex rounded-full bg-[#7a4b00] px-3 py-0.5 text-xs font-semibold text-white">Connect real data →</Link>}
          </div>
        )}
        {teamDbEnabled() && !isDemo() && !leadsConnected() && (
          <div className="bg-[#e8f1fb] px-4 py-2 text-center text-sm text-[#0b5a9c]">
            Leads aren&apos;t connected yet, so the pipeline is empty.
            {can(u, "admin") ? <Link href="/admin/connections" className="ml-2 inline-flex rounded-full bg-[#0b5a9c] px-3 py-0.5 text-xs font-semibold text-white">Connect Airtable →</Link> : " Ask an admin to connect Airtable."}
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
