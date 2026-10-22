import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin/auth";
import { can } from "@/lib/admin/team";
import { Panel } from "@/components/admin/Badges";
import CopyButton from "@/components/admin/CopyButton";

export const metadata = { title: "Email setup" };

const TEMPLATES = [
  { file: "1-reset-password.html", name: "Reset password", subject: "Reset your Oonava password" },
  { file: "2-invite-user.html", name: "Invite user", subject: "You're invited to the Oonava team" },
  { file: "3-confirm-signup.html", name: "Confirm signup", subject: "Confirm your Oonava email" },
  { file: "4-magic-link.html", name: "Magic link", subject: "Your Oonava sign-in link" },
  { file: "5-change-email.html", name: "Change email address", subject: "Confirm your new Oonava email" },
];

const SMTP = [
  ["Host", "smtp.resend.com"],
  ["Port", "465"],
  ["Username", "resend"],
  ["Password", "A Resend API key (paste it in Supabase only, never in chat)"],
  ["Sender email", "hello@oonava.com"],
  ["Sender name", "Oonava"],
];

export default async function EmailSetup() {
  const me = await requireUser();
  if (!can(me, "admin")) redirect("/admin?denied=1");
  const dir = path.join(process.cwd(), "docs", "email-templates");
  const html = await Promise.all(TEMPLATES.map((t) => readFile(path.join(dir, t.file), "utf8").catch(() => "")));
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/team" className="text-sm text-muted">← Team</Link>
        <h1 className="text-3xl font-semibold tracking-tight">Email setup</h1>
        <p className="text-sm text-muted">Admins only. These are the emails Supabase sends (password reset, invites, sign-in). Paste them in Supabase → Authentication → Emails → Templates, not in Resend.</p>
      </div>
      <Panel title="Templates">
        <div className="divide-y divide-line">
          {TEMPLATES.map((t, i) => (
            <div key={t.file} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted">Subject: {t.subject}</p>
                <p className="text-xs text-muted">{t.file}</p>
              </div>
              <CopyButton text={t.subject} label="Copy subject" />
              {html[i] ? <CopyButton text={html[i]} label="Copy HTML" /> : <span className="text-sm text-[#c8322f]">File missing</span>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="SMTP (Authentication → Emails → SMTP settings)">
        <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
          {SMTP.map(([k, v]) => (<Fragment key={k}><dt className="text-muted">{k}</dt><dd className="font-semibold break-words">{v}</dd></Fragment>))}
        </dl>
      </Panel>
      <Panel title="URLs (Authentication → URL Configuration)">
        <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted">Site URL</dt><dd className="font-semibold">https://oonava.com</dd>
          <dt className="text-muted">Redirect URL</dt><dd className="font-semibold">https://oonava.com/admin/reset</dd>
        </dl>
        <p className="mt-3 text-sm text-muted">Work addresses like samad@oonava.com need a forwarder in Hostinger to a personal inbox, or reset emails will never arrive.</p>
      </Panel>
    </div>
  );
}
