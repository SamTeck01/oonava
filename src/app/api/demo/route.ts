import { NextResponse, after } from "next/server";
import { qualifyDemo, viewingSlots } from "@/lib/automation/demo";
import { sendEmail, layout } from "@/lib/automation/email";
import { alertTeam } from "@/lib/automation/whatsapp";
import { env } from "@/lib/automation/env";

// Best-effort per-instance rate limit: 3 demo runs per IP per 10 minutes (each one calls the AI and sends an email).
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 3;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ error: "Bad request" }, { status: 400 }); // honeypot

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const str = (k: string, max: number) => String(body[k] ?? "").slice(0, max).trim();
  const name = str("name", 120), email = str("email", 200), message = str("message", 2000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Name, a valid email and an enquiry are required" }, { status: 422 });
  }

  const started = Date.now();
  const result = await qualifyDemo(message);
  const slots = viewingSlots();
  const mailBody = `${result.reply}\n\nSuggested viewing slots:\n${slots.map((s) => `• ${s}`).join("\n")}\n\n—\nThis reply was written and sent automatically by an Oonava demo, seconds after you pressed send. Northgate Estates is fictional. Want this for your agency?`;
  const cta = { label: "Book a free call with Oonava", url: env.calendlyUrl || `${env.siteUrl}/contact` };
  const mail = layout({ name, body: mailBody, cta });
  const emailed = await sendEmail({ to: email, subject: "Re: your property enquiry (Northgate Estates demo)", text: mail.text.replace("The Oonava team", "Northgate Estates (an Oonava demo)"), html: mail.html.replace("The Oonava team", "Northgate Estates (an Oonava demo)") });
  const seconds = +((Date.now() - started) / 1000).toFixed(1);

  // Someone trying the demo is a warm lead for Oonava itself.
  after(() => Promise.all([
    alertTeam(`🧪 Someone tried the live demo\n${name} · ${email}\nEnquiry: ${message.slice(0, 300)}\n${emailed ? `✅ Demo reply sent in ${seconds}s` : "⚠️ Demo email not sent"}`),
    sendEmail({ to: env.teamEmail, subject: `Live demo tried: ${name}`, text: `${name} <${email}> tried the live demo.\n\nEnquiry:\n${message}`, replyTo: email }),
  ]).catch((e) => console.error("[demo alert]", e)));

  return NextResponse.json({ ...result, slots, emailed, seconds });
}
