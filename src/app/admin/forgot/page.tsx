import type { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "@/components/admin/ForgotForm";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function Forgot() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-[var(--radius)] bg-bg p-8 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)]">
        <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
        <p className="mt-1 text-sm text-muted">Enter your work login and we&apos;ll email you a link to set a new password.</p>
        <ForgotForm />
        <p className="mt-6 text-center text-sm text-muted"><Link href="/admin/login" className="font-semibold text-fg underline underline-offset-4">Back to sign in</Link></p>
      </div>
    </main>
  );
}
