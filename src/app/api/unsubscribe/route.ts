import { verify } from "@/lib/automation/token";
import { updateLead } from "@/lib/automation/airtable";

const page = (msg: string) => new Response(`<!doctype html><meta name="viewport" content="width=device-width"><title>Oonava</title><body style="font-family:Arial,sans-serif;max-width:480px;margin:80px auto;padding:0 16px;color:#03030f"><p style="font-size:22px;font-weight:bold">oonava<span style="color:#26a0f8">.</span></p><p>${msg}</p></body>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  const t = u.searchParams.get("t") ?? "";
  if (!id || !verify(id, t)) return page("This link is invalid or has expired.");
  await updateLead(id, { Status: "Unsubscribed" });
  return page("You've been unsubscribed. You won't receive any more follow-ups from us.");
}
