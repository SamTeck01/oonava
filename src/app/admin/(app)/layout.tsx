import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/admin/auth";
import { teamDbEnabled } from "@/lib/admin/db";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Oonava admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const u = await requireUser();
  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <AdminNav user={{ name: u.name, title: u.title, permissions: u.permissions }} />
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        {!teamDbEnabled() && (
          <div className="bg-[#fff2d6] px-4 py-2 text-center text-sm text-[#7a4b00]">
            Showing <b>sample data</b>. Connect Airtable (AIRTABLE_TOKEN + AIRTABLE_BASE_ID) to use real data. Changes here aren&apos;t saved permanently.
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
