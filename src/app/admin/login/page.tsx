import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-[var(--radius)] bg-bg p-8 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)]">
        <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
        <p className="mt-1 text-sm text-muted">Admin dashboard</p>
        {adminConfigured() ? <LoginForm /> : (
          <p className="mt-8 rounded-xl bg-surface p-4 text-sm">The dashboard is locked. Add an <b>ADMIN_PASSWORD</b> (at least 8 characters) in Vercel → Settings → Environment Variables, then redeploy.</p>
        )}
      </div>
    </main>
  );
}
