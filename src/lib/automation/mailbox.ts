import "server-only";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { env } from "./env";

// The hello@ mailbox at Hostinger: cold outreach goes out over SMTP as plain one-to-one email
// (no HTML, images or tracking, which keeps it in the Primary tab), and replies are read over IMAP.
export const mailboxEnabled = () => Boolean(env.mailPassword);

const transport = () =>
  nodemailer.createTransport({ host: env.smtpHost, port: 465, secure: true, auth: { user: env.mailUser, pass: env.mailPassword } });

const imap = () =>
  new ImapFlow({ host: env.imapHost, port: 993, secure: true, auth: { user: env.mailUser, pass: env.mailPassword! }, logger: false });

export async function sendPlain(opts: { to: string; subject: string; text: string; inReplyTo?: string; unsubscribe?: string }): Promise<string | null> {
  if (!mailboxEnabled()) { console.log("[mailbox] (not configured)", opts.to, opts.subject); return null; }
  const headers: Record<string, string> = {};
  if (opts.unsubscribe) {
    headers["List-Unsubscribe"] = `<mailto:${env.mailUser}?subject=unsubscribe>, <${opts.unsubscribe}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const message = {
    from: { name: `${env.senderName} at Oonava`, address: env.mailUser },
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    headers,
    ...(opts.inReplyTo ? { inReplyTo: opts.inReplyTo, references: [opts.inReplyTo] } : {}),
  };
  try {
    const info = await transport().sendMail(message);
    // Keep a copy in the mailbox's Sent folder so the conversation is visible in Hostinger webmail too.
    saveToSent(message).catch(() => {});
    return info.messageId ?? "sent";
  } catch (e) {
    console.error("[mailbox] send", opts.to, e);
    return null;
  }
}

async function saveToSent(message: Parameters<ReturnType<typeof transport>["sendMail"]>[0]) {
  const raw: Buffer = await new Promise((resolve, reject) =>
    nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail(message, (err, info) => (err ? reject(err) : resolve(info.message as Buffer))));
  const client = imap();
  await client.connect();
  try {
    const list = await client.list();
    const sent = list.find((b) => b.specialUse === "\\Sent")?.path ?? "INBOX.Sent";
    await client.append(sent, raw, ["\\Seen"]);
  } finally {
    await client.logout().catch(() => {});
  }
}

export type InboxMessage = { uid: number; from: string; subject: string; date: Date; text: string; auto: boolean; bounceFor: string[] };

// Messages received in the last `days` days, newest first.
export async function recentInbox(days = 3, max = 150): Promise<InboxMessage[]> {
  if (!mailboxEnabled()) return [];
  const client = imap();
  await client.connect();
  const out: InboxMessage[] = [];
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = (await client.search({ since: new Date(Date.now() - days * 86_400_000) }, { uid: true })) || [];
      for await (const m of client.fetch(uids.slice(-max), { uid: true, envelope: true, headers: ["auto-submitted", "x-autoreply", "x-autorespond", "precedence"], source: { start: 0, maxLength: 20_000 } }, { uid: true })) {
        const from = (m.envelope?.from?.[0]?.address ?? "").toLowerCase();
        const subject = m.envelope?.subject ?? "";
        const hdr = m.headers?.toString().toLowerCase() ?? "";
        const raw = m.source?.toString("utf8") ?? "";
        const body = raw.split(/\r?\n\r?\n/).slice(1).join("\n\n");
        const isBounce = /mailer-daemon|postmaster/.test(from) || /undeliver|delivery status notification|returned mail|failure notice/i.test(subject);
        const auto = /auto-submitted:\s*auto-(replied|generated)|x-autoreply|x-autorespond|precedence:\s*(auto_reply|bulk|junk)/.test(hdr) || /out of (the )?office|automatic reply|auto(matic)?[- ]?reply|away from/i.test(subject);
        const bounceFor = isBounce ? [...new Set((body.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) ?? []).map((e) => e.toLowerCase()).filter((e) => e !== env.mailUser.toLowerCase() && !/mailer-daemon|postmaster/.test(e)))] : [];
        out.push({ uid: m.uid, from, subject, date: new Date(m.envelope?.date ?? Date.now()), text: body.replace(/=\r?\n/g, "").slice(0, 4000), auto, bounceFor });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function verifyMailbox(): Promise<{ ok: boolean; text: string }> {
  if (!mailboxEnabled()) return { ok: false, text: "Add MAIL_PASSWORD (the hello@oonava.com mailbox password) in Vercel and redeploy." };
  try {
    await transport().verify();
    const client = imap();
    await client.connect();
    await client.logout();
    return { ok: true, text: `Connected to ${env.mailUser}: sending (SMTP) and reading replies (IMAP) both work.` };
  } catch (e) {
    return { ok: false, text: `Couldn't sign in to ${env.mailUser}: ${(e as Error).message}. Check MAIL_PASSWORD.` };
  }
}
