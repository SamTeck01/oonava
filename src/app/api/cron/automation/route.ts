import { NextResponse } from "next/server";
import { env } from "@/lib/automation/env";
import { runOutreach } from "@/lib/automation/outreach";
import { runSourcing } from "@/lib/automation/sourcing";
import { runHunter } from "@/lib/automation/hunter";
import { deliverabilityChecks } from "@/lib/automation/deliverability";
import { alertTeam } from "@/lib/automation/whatsapp";

export const maxDuration = 300;

// Runs the sales machine: read replies → find new leads → send first emails and follow-ups.
// Vercel runs it once a day; an external pinger (cron-job.org, every 20 min) keeps it going through the day.
// ?report=1 also posts the daily deliverability report to the team.
export async function GET(req: Request) {
  const prod = process.env.NODE_ENV === "production";
  if ((prod && !env.cronSecret) || (env.cronSecret && req.headers.get("authorization") !== `Bearer ${env.cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const daily = new URL(req.url).searchParams.get("report") === "1";
  // The web-research hunt costs a little per run, so it only runs on the daily schedule.
  const hunter = daily ? await runHunter().catch((e) => ({ added: 0, log: [`Signal hunter failed: ${(e as Error).message}`] })) : { added: 0, log: [] as string[] };
  const sourcing = await runSourcing().catch((e) => ({ added: 0, log: [`Sourcing failed: ${(e as Error).message}`] }));
  const outreach = await runOutreach().catch((e) => ({ sent: 0, log: [`Outreach failed: ${(e as Error).message}`] }));
  if (daily) {
    const checks = await deliverabilityChecks().catch(() => []);
    const bad = checks.filter((c) => c.ok === false);
    await alertTeam([
      "📊 Oonava sales machine: daily report",
      ...hunter.log, ...sourcing.log, ...outreach.log,
      bad.length ? `⚠️ Deliverability issues:\n${bad.map((c) => `• ${c.name}: ${c.detail}`).join("\n")}` : "✅ Deliverability checks passed",
    ].join("\n"));
  }
  return NextResponse.json({ hunter, sourcing, outreach });
}
