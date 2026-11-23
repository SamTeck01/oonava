import "server-only";
import { env } from "./env";
import { findLeads, updateLead, escapeFormula, type LeadRecord } from "./airtable";
import { generateJson } from "./ai";
import { sendPlain, recentInbox, mailboxEnabled } from "./mailbox";
import { unsubscribeUrl } from "./token";
import { alertTeam } from "./whatsapp";

type Rec = { id: string; fields: LeadRecord; createdTime?: string };

// Cold outreach sequence: first email, then follow-ups 3–4 days apart, then stop.
export const STEP_GAPS_DAYS = [3, 4, 4]; // after step 1, 2, 3
export const MAX_STEPS = STEP_GAPS_DAYS.length + 1;
const WEBSITE_SOURCES = ["Contact form", "Estimate tool"]; // inbound enquiries have their own reply + follow-ups

const DAY = 86_400_000;
const todayISO = () => new Date().toISOString().slice(0, 10);

// Words that push plain email towards spam folders.
const SPAMMY = /\b(free|guarantee[d]?|act now|limited time|risk[- ]free|100%|click here|buy now|cash|winner|urgent|amazing|incredible|best price|no obligation|special offer|!!+)\b/gi;
export const spamWords = (s: string) => [...new Set((s.match(SPAMMY) ?? []).map((w) => w.toLowerCase()))];

// Sending window: Monday–Friday, 08:00–17:30 UK time.
export function inSendWindow(d = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d).map((p) => [p.type, p.value]));
  const mins = Number(parts.hour) * 60 + Number(parts.minute);
  return !["Sat", "Sun"].includes(parts.weekday) && mins >= 8 * 60 && mins <= 17 * 60 + 30;
}

// Warm-up: start at 10/day and add 5 a day up to the cap, so the mailbox builds a good reputation.
export function todaysCap() {
  const cap = Math.max(0, env.outreachDailyCap);
  if (!env.outreachStart) return Math.min(cap, 10);
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(env.outreachStart)) / DAY));
  return Math.min(cap, 10 + days * 5);
}

const isOutreach = `AND({Outreach Step} > 0, NOT(OR(${WEBSITE_SOURCES.map((s) => `{Source}='${s}'`).join(",")})))`;

export async function outreachStats() {
  const recent = await findLeads(`AND(${isOutreach}, IS_AFTER({Last Contacted}, DATEADD(TODAY(), -14, 'days')))`);
  const sentToday = recent.filter((r) => (r.fields["Last Contacted"] ?? "").slice(0, 10) === todayISO()).length;
  const contacted = recent.length;
  const by = (s: string) => recent.filter((r) => r.fields.Status === s).length;
  const bounced = by("Bounced"), replied = by("Replied") + by("Booked") + by("Proposal") + by("Won"), unsub = by("Unsubscribed");
  const pct = (n: number) => (contacted ? Math.round((n / contacted) * 1000) / 10 : 0);
  const queue = await findLeads(`AND({Status}='New', OR({Outreach Step}=BLANK(), {Outreach Step}=0), {Email}!='', NOT(OR(${WEBSITE_SOURCES.map((s) => `{Source}='${s}'`).join(",")})))`);
  const due = await findLeads(`AND({Status}='Contacted', ${isOutreach}, {Outreach Step} < ${MAX_STEPS}, IS_BEFORE({Next Send}, NOW()))`);
  return { sentToday, cap: todaysCap(), contacted, bounced, replied, unsub, bounceRate: pct(bounced), replyRate: pct(replied), unsubRate: pct(unsub), queued: queue.length, due: due.length };
}

// Pause automatically if the list or the copy is hurting the mailbox's reputation.
export function healthProblem(s: { contacted: number; bounceRate: number; unsubRate: number }) {
  if (s.contacted < 20) return null;
  if (s.bounceRate > 5) return `Bounce rate is ${s.bounceRate}% (limit 5%). Clean the lead list before sending more.`;
  if (s.unsubRate > 3) return `Unsubscribe rate is ${s.unsubRate}% (limit 3%). Rework the targeting or the message.`;
  return null;
}

const schema = { type: "OBJECT", properties: { subject: { type: "STRING" }, body: { type: "STRING" } }, required: ["subject", "body"] };

const FIRST_SYSTEM = `You write short, personal B2B cold emails for Oonava, a UK AI automation and software agency (lead response, follow-up automation, connecting business tools, custom systems).
Rules: 60–110 words. Plain text, no links, no bullet points, no emojis, no exclamation marks, no hype or salesy words (free, guarantee, amazing, limited time).
Open with something specific about their business or role. If the notes contain a "Signal:" or "Opening line idea:", open with that exact observation in natural words (it's the reason we're writing). Name one concrete, likely pain (slow replies to enquiries, manual follow-ups, copying data between tools). One sentence on how we fix it.
End with a soft yes/no question (e.g. "Worth a quick chat?"). Do not include a greeting line or sign-off; they are added for you.
Subject: 2–5 words, lowercase except names, looks like a normal email between people (e.g. "enquiries at {company}"). Return JSON {subject, body}.`;

const FOLLOW_SYSTEM = `You write a short follow-up to a cold email for Oonava, a UK automation agency. 25–60 words, plain text, no links, no emojis, no hype.
Add one new angle or small useful idea; don't just "bump". Follow-up number tells you the tone: 2 = new angle, 3 = short example of a result, 4 = polite last note saying you'll stop emailing.
No greeting or sign-off. Return JSON {subject, body} (subject is ignored).`;

async function write(r: Rec, step: number) {
  const f = r.fields;
  const facts = [`Name: ${f.Name}`, f.Company && `Company: ${f.Company}`, f.Industry && `Industry: ${f.Industry}`, f.Website && `Website: ${f.Website}`, f.Notes && `Notes: ${f.Notes.slice(0, 1200)}`, f.Summary && `About: ${f.Summary}`].filter(Boolean).join("\n");
  const fallbackFirst = {
    subject: `enquiries at ${f.Company || "your business"}`.toLowerCase(),
    body: `I came across ${f.Company || "your business"} and had a quick question. When a new enquiry comes in after hours, how long does it usually take your team to reply?\n\nWe build simple automations that answer and qualify new enquiries within a minute and follow up for you, connected to the tools you already use.\n\nWorth a quick chat?`,
  };
  const fallbackFollow = [
    "",
    "",
    { subject: "", body: "Quick follow-up on my note below. Most teams we speak to lose more leads to slow replies than to competitors. If that rings true, happy to show you what an automated first reply would look like for you." },
    { subject: "", body: "One example: an agency we mapped was replying to portal enquiries the next morning. Automating the first reply and the follow-ups meant every enquiry got an answer in under a minute. Would something like that help you?" },
    { subject: "", body: "I won't keep filling your inbox, so this is my last note. If automating enquiries or follow-ups is ever on your list, just reply and I'll pick it up." },
  ];
  const r1 = step === 1
    ? await generateJson(FIRST_SYSTEM, facts, schema, fallbackFirst)
    : await generateJson(FOLLOW_SYSTEM, `Follow-up number: ${step}\n${facts}\nPrevious subject: ${f["Email Subject"] ?? ""}`, schema, fallbackFollow[step] as { subject: string; body: string });
  let body = (r1.body || "").trim();
  // Never send copy that trips spam filters: fall back to the safe template instead.
  if (!body || spamWords(body).length || /https?:\/\//.test(body)) body = (step === 1 ? fallbackFirst : (fallbackFollow[step] as { body: string })).body;
  const subject = step === 1 ? (spamWords(r1.subject).length || !r1.subject ? fallbackFirst.subject : r1.subject).slice(0, 80) : `Re: ${f["Email Subject"] || fallbackFirst.subject}`;
  return { subject, body };
}

function compose(r: Rec, body: string) {
  const first = (r.fields.Name ?? "").trim().split(" ")[0];
  const hi = first && !/@/.test(first) && first.toLowerCase() !== (r.fields.Company ?? "").toLowerCase() ? `Hi ${first},` : "Hi,";
  return `${hi}\n\n${body}\n\n${env.senderName}\nOonava · AI automation for growing businesses\noonava.com\n\nNot relevant? Reply "no thanks" and I won't email again, or unsubscribe: ${unsubscribeUrl(r.id)}`;
}

const append = (prev: string | undefined, line: string) => `${prev ? prev + "\n" : ""}${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${line}`;

async function sendStep(r: Rec, step: number) {
  const { subject, body } = await write(r, step);
  const text = compose(r, body);
  const id = await sendPlain({ to: r.fields.Email!, subject, text, inReplyTo: step > 1 ? r.fields["Message ID"] : undefined, unsubscribe: unsubscribeUrl(r.id) });
  if (!id) return false;
  const now = new Date();
  const gap = STEP_GAPS_DAYS[step - 1];
  await updateLead(r.id, {
    Status: "Contacted",
    "Outreach Step": step,
    "Next Send": gap ? new Date(now.getTime() + gap * DAY).toISOString() : null,
    "Last Contacted": now.toISOString(),
    ...(step === 1 ? { "First Contacted": now.toISOString(), "Email Subject": subject, "Message ID": id } : {}),
    "Follow-ups Sent": step - 1,
    Activity: append(r.fields.Activity, `Auto-outreach email ${step}/${MAX_STEPS} sent: "${subject}"`),
  });
  return true;
}

// Mark replies, bounces and unsubscribes from the inbox so sequences stop at once.
export async function processInbox() {
  if (!mailboxEnabled()) return { replies: 0, bounces: 0, unsubscribes: 0 };
  const msgs = await recentInbox(4);
  if (!msgs.length) return { replies: 0, bounces: 0, unsubscribes: 0 };
  const emails = [...new Set(msgs.flatMap((m) => (m.bounceFor.length ? m.bounceFor : [m.from])))].filter(Boolean).slice(0, 80);
  if (!emails.length) return { replies: 0, bounces: 0, unsubscribes: 0 };
  const leads = await findLeads(`OR(${emails.map((e) => `LOWER({Email})='${escapeFormula(e)}'`).join(",")})`);
  const byEmail = new Map(leads.map((l) => [(l.fields.Email ?? "").toLowerCase(), l]));
  let replies = 0, bounces = 0, unsubscribes = 0;
  for (const m of msgs.slice().reverse()) {
    if (m.bounceFor.length) {
      for (const e of m.bounceFor) {
        const l = byEmail.get(e);
        if (l && !["Bounced", "Replied", "Booked", "Proposal", "Won"].includes(l.fields.Status ?? "")) {
          await updateLead(l.id, { Status: "Bounced", "Next Send": null, Activity: append(l.fields.Activity, "Email bounced: address doesn't exist. Sequence stopped.") });
          l.fields.Status = "Bounced"; bounces++;
        }
      }
      continue;
    }
    const l = byEmail.get(m.from);
    if (!l || m.auto) continue;
    const st = l.fields.Status ?? "New";
    if (["Replied", "Booked", "Proposal", "Won", "Lost", "Unsubscribed"].includes(st)) continue;
    if ((l.fields["Last Contacted"] ?? "") > m.date.toISOString() && st !== "Contacted") continue;
    const wantsOut = /\b(unsubscribe|remove me|no thanks|not interested|stop emailing|take me off)\b/i.test(`${m.subject}\n${m.text.slice(0, 600)}`);
    const status = wantsOut ? "Unsubscribed" : "Replied";
    await updateLead(l.id, { Status: status, "Next Send": null, Activity: append(l.fields.Activity, wantsOut ? "Replied asking not to be contacted. Unsubscribed." : `Replied: "${m.subject}". Sequence stopped.`) });
    l.fields.Status = status;
    if (wantsOut) unsubscribes++;
    else {
      replies++;
      const snippet = m.text.replace(/\s+/g, " ").replace(/^.*?(content-transfer-encoding:[^ ]+ )/i, "").slice(0, 280);
      await alertTeam(`💬 Reply from ${l.fields.Name}${l.fields.Company ? ` (${l.fields.Company})` : ""}\n${m.from}\n"${m.subject}"\n${snippet}\n\nOpen: ${env.siteUrl}/admin/leads/${l.id}`);
    }
  }
  return { replies, bounces, unsubscribes };
}

// One pass: read the inbox, then send first emails and due follow-ups within today's limits.
export async function runOutreach(opts: { force?: boolean } = {}) {
  const log: string[] = [];
  const inbox = await processInbox().catch((e) => { console.error("[outreach] inbox", e); return { replies: 0, bounces: 0, unsubscribes: 0 }; });
  if (inbox.replies || inbox.bounces || inbox.unsubscribes) log.push(`Inbox: ${inbox.replies} replies, ${inbox.bounces} bounces, ${inbox.unsubscribes} unsubscribes.`);
  if (!env.outreachEnabled) return { sent: 0, log: [...log, "Auto-outreach is off (OUTREACH_ENABLED is not true)."] };
  if (!mailboxEnabled()) return { sent: 0, log: [...log, "Mailbox not connected (MAIL_PASSWORD missing)."] };
  if (!opts.force && !inSendWindow()) return { sent: 0, log: [...log, "Outside sending hours (Mon–Fri 08:00–17:30 UK). Queued for the next window."] };
  const stats = await outreachStats();
  const problem = healthProblem(stats);
  if (problem) {
    log.push(`Paused: ${problem}`);
    if (new Date().getUTCHours() === 8) await alertTeam(`⚠️ Oonava auto-outreach paused. ${problem}`);
    return { sent: 0, log };
  }
  let budget = Math.min(stats.cap - stats.sentToday, env.outreachBatch);
  if (budget <= 0) return { sent: 0, log: [...log, `Daily limit reached (${stats.sentToday}/${stats.cap}).`] };

  const due = await findLeads(`AND({Status}='Contacted', ${isOutreach}, {Outreach Step} < ${MAX_STEPS}, IS_BEFORE({Next Send}, NOW()))`);
  const fresh = await findLeads(`AND({Status}='New', OR({Outreach Step}=BLANK(), {Outreach Step}=0), {Email}!='', NOT(OR(${WEBSITE_SOURCES.map((s) => `{Source}='${s}'`).join(",")})))`);
  let sent = 0;
  // Follow-ups first (they convert better), then new leads, oldest first.
  for (const [r, step] of [...due.map((r) => [r, (r.fields["Outreach Step"] ?? 1) + 1] as const), ...fresh.sort((a, b) => (a.createdTime ?? "").localeCompare(b.createdTime ?? "")).map((r) => [r, 1] as const)]) {
    if (budget <= 0) break;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.fields.Email ?? "")) continue;
    if (await sendStep(r, step)) { sent++; budget--; log.push(`Email ${step} → ${r.fields.Email}`); }
    await new Promise((res) => setTimeout(res, 4000 + Math.random() * 6000)); // human-like spacing
  }
  // Leads that got the last step and never replied are closed out.
  const finished = await findLeads(`AND({Status}='Contacted', ${isOutreach}, {Outreach Step} >= ${MAX_STEPS}, IS_BEFORE({Last Contacted}, DATEADD(NOW(), -5, 'days')))`);
  for (const r of finished) await updateLead(r.id, { Status: "No response", Activity: append(r.fields.Activity, "Sequence finished with no reply.") });
  log.push(`Sent ${sent}. Today ${stats.sentToday + sent}/${stats.cap}.`);
  return { sent, log };
}
