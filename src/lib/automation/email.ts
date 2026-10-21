import { env } from "./env";

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  if (!env.resendKey) { console.log("[email] (not configured)", opts.to, opts.subject); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.mailFrom, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, reply_to: opts.replyTo ?? env.teamEmail }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) console.error("[email]", res.status, await res.text());
  return res.ok;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// Turn plain text into safe HTML: blank lines split paragraphs, single newlines become <br>, URLs become links.
function rich(p: string) {
  return esc(p)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0b6fc0;text-decoration:underline">$1</a>')
    .replace(/\n/g, "<br>");
}

type LayoutOpts = {
  name: string;
  body: string;
  cta?: { label: string; url: string };
  unsubscribeUrl?: string;
  preheader?: string;
  kind?: "client" | "team";
  signature?: { name: string; title?: string };
};

// Branded Oonava email: works in Gmail, Outlook and Apple Mail (table layout, inline styles, light & dark).
export function layout({ name, body, cta, unsubscribeUrl, preheader, kind = "client", signature }: LayoutOpts) {
  const first = name.trim().split(" ")[0] || "there";
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const site = env.siteUrl.replace(/\/$/, "");
  const signer = signature?.name ? `${signature.name}${signature.title ? `, ${signature.title}` : ""}` : "The Oonava team";
  const pre = (preheader ?? paras[0] ?? "").slice(0, 140);

  const text = [
    `Hi ${first},`,
    ...paras,
    cta ? `${cta.label}: ${cta.url}` : "",
    `Best regards,\n${signer}\nOonava · AI automation, integrations & custom systems\n${site.replace(/^https?:\/\//, "")}`,
    kind === "team" ? "You're receiving this because you're on the Oonava team." : unsubscribeUrl ? `Don't want follow-ups? Unsubscribe: ${unsubscribeUrl}` : "",
  ].filter(Boolean).join("\n\n");

  const button = cta ? `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
  <tr><td style="border-radius:999px;background:#0b6fc0">
    <a href="${esc(cta.url)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${esc(cta.label)} &rarr;</a>
  </td></tr>
</table>
<p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#8a8f96">Button not working? Copy this link: <a href="${esc(cta.url)}" style="color:#0b6fc0;word-break:break-all">${esc(cta.url)}</a></p>` : "";

  const footerNote = kind === "team"
    ? "You're receiving this because you're on the Oonava team."
    : unsubscribeUrl
      ? `You received this because you contacted Oonava. <a href="${esc(unsubscribeUrl)}" style="color:#8a8f96;text-decoration:underline">Unsubscribe</a> from follow-ups.`
      : "You received this because you contacted Oonava.";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>Oonava</title>
<style>@media (prefers-color-scheme: dark){.bg{background:#0b0b14!important}.card{background:#14141f!important}.ink{color:#f5f5f7!important}.muted{color:#a0a4ab!important}.rule{border-color:#2a2a36!important}}@media (max-width:620px){.card{padding:28px 22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#f3f3f5" class="bg">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all">${esc(pre)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:#f3f3f5">
<tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
    <tr><td style="padding:0 8px 18px">
      <a href="${site}" style="text-decoration:none"><img src="${site}/email/oonava-logo.png" width="112" alt="oonava." style="display:block;border:0;width:112px;height:auto;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;color:#03030f"></a>
    </td></tr>
    <tr><td class="card" style="background:#ffffff;border-radius:20px;padding:40px 44px;font-family:Arial,Helvetica,sans-serif">
      <p class="ink" style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#03030f">Hi ${esc(first)},</p>
      ${paras.map((p) => `<p class="ink" style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#03030f">${rich(p)}</p>`).join("\n      ")}
      ${button}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr><td class="rule" style="border-top:1px solid #e6e6ea;padding-top:22px">
        <p class="ink" style="margin:0;font-size:15px;line-height:1.6;color:#03030f">Best regards,<br><strong>${esc(signer)}</strong></p>
        <p class="muted" style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#6b7075">Oonava &middot; <span style="color:#0b6fc0">Automate. Integrate. Build.</span></p>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:22px 8px 0;font-family:Arial,Helvetica,sans-serif">
      <p class="muted" style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#8a8f96"><a href="${site}" style="color:#8a8f96;text-decoration:none"><strong>Oonava</strong></a> &middot; AI automation, integrations &amp; custom systems &middot; UK &amp; Europe</p>
      <p class="muted" style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#8a8f96"><a href="${site}" style="color:#8a8f96">${site.replace(/^https?:\/\//, "")}</a> &middot; <a href="mailto:hello@oonava.com" style="color:#8a8f96">hello@oonava.com</a></p>
      <p class="muted" style="margin:0;font-size:12px;line-height:1.6;color:#8a8f96">${footerNote}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
  return { text, html };
}
