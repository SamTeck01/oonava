import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { loginConfigured, currentUser, demoLoginAllowed } from "@/lib/admin/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await currentUser()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-[var(--radius)] bg-bg p-8 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)]">
        <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
        <p className="mt-1 text-sm text-muted">Admin dashboard</p>
        {loginConfigured() ? <LoginForm /> : (
          <p className="mt-8 rounded-xl bg-surface p-4 text-sm">The dashboard isn&apos;t connected yet. Add <b>SUPABASE_URL</b>, <b>SUPABASE_SERVICE_ROLE_KEY</b> and <b>ADMIN_EMAILS</b> in Vercel, then redeploy.</p>
        )}
        {loginConfigured() && <p className="mt-4 text-center text-sm"><Link href="/admin/forgot" className="text-muted underline underline-offset-4 hover:text-fg">Forgot password?</Link></p>}
        <p className="mt-3 text-center text-sm text-muted">New to the team? <Link href="/admin/signup" className="font-semibold text-fg underline underline-offset-4">Request an account</Link></p>
        {demoLoginAllowed() && <p className="mt-4 rounded-xl bg-[#fff2d6] p-3 text-xs text-[#7a4b00]">Sample mode: sign in as kelly@, samad@, delight@ or fel@oonava.com with password <b>demo12345</b> to see each person&apos;s view.</p>}
      </div>
    </main>
  );
}
