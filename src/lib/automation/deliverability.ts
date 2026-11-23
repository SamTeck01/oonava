import "server-only";
import { env } from "./env";
import { outreachStats, healthProblem } from "./outreach";

// Checks the things that decide whether our email lands in the inbox, spam or Promotions.
export type Check = { name: string; ok: boolean | null; detail: string; fix?: string };

const domain = () => env.mailUser.split("@")[1] ?? "oonava.com";

async function dns(name: string, type: "TXT" | "MX" | "A" | "CNAME") {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return ((data.Answer ?? []) as { data: string }[]).map((a) => a.data.replace(/^"|"$/g, "").replace(/" "/g, ""));
  } catch { return null; }
}

export async function deliverabilityChecks(): Promise<Check[]> {
  const d = domain();
  const checks: Check[] = [];
  if ((await dns(d, "A")) === null) return [{ name: "DNS lookups", ok: null, detail: "Couldn't reach the DNS checker right now. Try again in a minute." }];

  const txt = (await dns(d, "TXT")) ?? [];
  const spf = txt.filter((t) => t.startsWith("v=spf1"));
  checks.push(spf.length === 1
    ? { name: "SPF", ok: /hostinger/i.test(spf[0]), detail: spf[0], fix: /hostinger/i.test(spf[0]) ? undefined : "Add include:_spf.mail.hostinger.com to the SPF record in Hostinger DNS." }
    : { name: "SPF", ok: false, detail: spf.length ? `${spf.length} SPF records (must be exactly one)` : "No SPF record", fix: "Have exactly one TXT record starting v=spf1 that includes Hostinger (and Resend's send subdomain stays separate)." });

  const hostingerDkim = (await Promise.all(["hostingermail1", "hostingermail2", "hostingermail3"].map((s) => dns(`${s}._domainkey.${d}`, "CNAME")))).some((a) => a && a.length);
  const hostingerDkimTxt = hostingerDkim || (await Promise.all(["hostingermail1", "hostingermail2", "hostingermail3"].map((s) => dns(`${s}._domainkey.${d}`, "TXT")))).some((a) => a && a.length);
  checks.push({ name: "DKIM (Hostinger mailbox)", ok: hostingerDkimTxt, detail: hostingerDkimTxt ? "Signing key found" : "No Hostinger DKIM key found", fix: hostingerDkimTxt ? undefined : "In Hostinger → Emails → DNS settings, turn on DKIM for oonava.com (adds hostingermail._domainkey records)." });

  const resendDkim = await dns(`resend._domainkey.${d}`, "TXT");
  checks.push({ name: "DKIM (Resend)", ok: !!resendDkim?.length, detail: resendDkim?.length ? "Signing key found" : "No Resend DKIM key", fix: resendDkim?.length ? undefined : "Add the DKIM record Resend shows under Domains → oonava.com." });

  const dmarc = ((await dns(`_dmarc.${d}`, "TXT")) ?? []).find((t) => t.startsWith("v=DMARC1"));
  checks.push({ name: "DMARC", ok: !!dmarc, detail: dmarc ?? "No DMARC record", fix: dmarc ? (/p=none/.test(dmarc) ? "Working. After 2–4 clean weeks, change p=none to p=quarantine for extra trust." : undefined) : "Add TXT _dmarc = v=DMARC1; p=none; rua=mailto:hello@oonava.com" });

  const mx = (await dns(d, "MX")) ?? [];
  checks.push({ name: "MX (receiving)", ok: mx.some((m) => /hostinger/i.test(m)), detail: mx.join(", ") || "No MX records" });

  // Domain blocklists. Some lists refuse public DNS lookups; that shows as "unknown" rather than a failure.
  for (const [list, label] of [["dbl.spamhaus.org", "Spamhaus DBL"], ["multi.surbl.org", "SURBL"], ["multi.uribl.com", "URIBL"]] as const) {
    const a = await dns(`${d}.${list}`, "A");
    const blocked = a === null || a.some((ip) => /^127\.255\.255\./.test(ip) || ip === "127.0.0.1");
    checks.push({ name: `Blocklist: ${label}`, ok: blocked ? null : !a.length, detail: blocked ? "Couldn't check (list blocks public lookups)" : a.length ? `LISTED (${a.join(", ")})` : "Not listed", fix: a?.length && !blocked ? `Request delisting at ${label} and pause outreach until cleared.` : undefined });
  }

  const s = await outreachStats().catch(() => null);
  if (s) {
    const problem = healthProblem(s);
    checks.push({ name: "Bounce rate (14 days)", ok: s.contacted < 20 ? null : s.bounceRate <= 3, detail: `${s.bounceRate}% of ${s.contacted} contacted`, fix: s.bounceRate > 3 ? "Stop importing unverified lists. Over 5% pauses outreach automatically." : undefined });
    checks.push({ name: "Unsubscribe rate (14 days)", ok: s.contacted < 20 ? null : s.unsubRate <= 2, detail: `${s.unsubRate}%`, fix: s.unsubRate > 2 ? "Tighten targeting and make the first line more relevant." : undefined });
    checks.push({ name: "Reply rate (14 days)", ok: s.contacted < 20 ? null : s.replyRate >= 2, detail: `${s.replyRate}%`, fix: s.contacted >= 20 && s.replyRate < 2 ? "Low replies usually means spam folder or weak targeting. Run a mail-tester.com test." : undefined });
    checks.push({ name: "Sending volume today", ok: s.sentToday <= s.cap, detail: `${s.sentToday} of ${s.cap} (warm-up limit)` });
    if (problem) checks.push({ name: "Auto-pause", ok: false, detail: problem });
  }
  return checks;
}
