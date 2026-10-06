import { NextResponse, after } from "next/server";
import { handleEnquiry } from "@/lib/automation/pipeline";

// Best-effort per-instance rate limit: 5 submissions per IP per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const str = (k: string, max: number) => String(body[k] ?? "").slice(0, max).trim();
  const lead = { name: str("name", 120), email: str("email", 200), company: str("company", 200), phone: str("phone", 40), message: str("message", 4000), context: str("context", 4000) };
  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 422 });
  }

  // Respond instantly; the automation runs after the response is sent.
  after(() => handleEnquiry(lead, lead.context.startsWith("Estimate") ? "Estimate tool" : "Contact form").catch((e) => console.error("[enquiry]", e)));
  return NextResponse.json({ ok: true });
}
