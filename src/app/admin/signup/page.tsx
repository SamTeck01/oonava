import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, loginConfigured } from "@/lib/admin/auth";
import SignupForm from "@/components/admin/SignupForm";

export const metadata: Metadata = { title: "Request an account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Signup() {
  if (await currentUser()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm rounded-[var(--radius)] bg-bg p-8 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)]">
        <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
        <p className="mt-1 text-sm text-muted">Request a team account. An admin approves it and gives you access.</p>
        {loginConfigured() ? <SignupForm /> : <p className="mt-8 rounded-xl bg-surface p-4 text-sm">Accounts aren&apos;t set up yet. Ask an admin to connect Supabase.</p>}
        <p className="mt-6 text-center text-sm text-muted">Already approved? <Link href="/admin/login" className="font-semibold text-fg underline underline-offset-4">Sign in</Link></p>
      </div>
    </main>
  );
}
