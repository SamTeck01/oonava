import type { Metadata } from "next";
import ResetForm from "@/components/admin/ResetForm";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Reset() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-[var(--radius)] bg-bg p-8 shadow-[0_30px_80px_-40px_rgba(3,3,15,.25)]">
        <p className="text-2xl font-bold tracking-tight">oonava<span className="text-accent">.</span></p>
        <p className="mt-1 text-sm text-muted">Choose a new password for the Oonava dashboard.</p>
        <ResetForm />
      </div>
    </main>
  );
}
