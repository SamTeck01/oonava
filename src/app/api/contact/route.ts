import { NextResponse } from "next/server";

// Sends the enquiry via Resend when RESEND_API_KEY + CONTACT_TO are set; otherwise logs it.
export async function POST(req: Request) {
  let body: Record<string, string>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const name = String(body.name ?? "").slice(0, 200).trim();
  const email = String(body.email ?? "").slice(0, 200).trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Name and a valid email are required" }, { status: 422 });

  const text = [
    `Name: ${name}`, `Email: ${email}`, `Company: ${body.company ?? ""}`, `Phone: ${body.phone ?? ""}`,
    "", String(body.message ?? "").slice(0, 5000), "", String(body.context ?? "").slice(0, 5000),
  ].join("\n");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    console.log("[contact] (email not configured)\n" + text);
    return NextResponse.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.CONTACT_FROM ?? "Oonava <onboarding@resend.dev>", to, reply_to: email, subject: `New enquiry: ${name}`, text }),
  });
  if (!res.ok) return NextResponse.json({ error: "Could not send" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
