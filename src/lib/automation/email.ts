import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

// Sends through the Hostinger mailbox over SMTP, so mail comes from a real oonava.com inbox.
let transport: Transporter | null = null;
function mailer() {
  if (!env.smtpUser || !env.smtpPass) return null;
  return (transport ??= nodemailer.createTransport({
    host: env.smtpHost, port: env.smtpPort, secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
    connectionTimeout: 10000, socketTimeout: 15000,
  }));
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  const t = mailer();
  if (!t) { console.log("[email] (not configured)", opts.to, opts.subject); return false; }
  try {
    await t.sendMail({ from: env.mailFrom, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, replyTo: opts.replyTo ?? env.teamEmail });
    return true;
  } catch (e) {
    console.error("[email]", e);
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

// Simple branded email: greeting, paragraphs, optional button, sign-off, unsubscribe footer.
export function layout({ name, body, cta, unsubscribeUrl }: { name: string; body: string; cta?: { label: string; url: string }; unsubscribeUrl?: string }) {
  const first = name.split(" ")[0];
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const text = [`Hi ${first},`, ...paras, cta ? `${cta.label}: ${cta.url}` : "", "Best,\nThe Oonava team\noonava.com", unsubscribeUrl ? `\nDon't want follow-ups? ${unsubscribeUrl}` : ""].filter(Boolean).join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#03030f;max-width:560px">
<p>Hi ${esc(first)},</p>${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
${cta ? `<p style="margin:28px 0"><a href="${cta.url}" style="background:#0b6fc0;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${esc(cta.label)}</a></p>` : ""}
<p>Best,<br>The Oonava team<br><a href="https://oonava.com" style="color:#0b6fc0">oonava.com</a></p>
${unsubscribeUrl ? `<p style="font-size:12px;color:#6b7075;margin-top:32px">Don't want follow-ups? <a href="${unsubscribeUrl}" style="color:#6b7075">Unsubscribe</a></p>` : ""}</div>`;
  return { text, html };
}
