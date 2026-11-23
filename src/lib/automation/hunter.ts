import "server-only";
import { env } from "./env";
import { claudeEnabled, claudeResearch } from "./claude";
import { createLead, findLeads, listLeads } from "./airtable";

// Daily "client hunt" (based on the Client Hunter method): Claude searches the live web for UK
// businesses showing a buying signal Oonava can fix, checks the proof, scores each lead,
// and only keeps strong ones. Their first email then opens with the exact problem it found.

const SIGNALS = [
  "1–3 star Google or Trustpilot reviews from the last 60 days complaining about slow replies, unanswered calls or emails, or no follow-up",
  "job ads posted in the last 30 days for a receptionist, admin assistant, lettings/sales administrator or customer service role (work we could automate instead)",
  "businesses that opened a new branch or office in the last 60 days, or announced growth/funding",
  "reviews or social posts in the last 60 days where customers say they couldn't book, never heard back, or waited days for a reply",
];

const SYSTEM = `You are Oonava's lead researcher. Oonava is a UK AI automation agency: instant replies to enquiries, automatic follow-ups, booking automation, connecting business tools, custom systems. Setup €1,500–€10,000 plus €199–€999/month.
Best-fit clients: estate and letting agents first; also other enquiry-heavy small and mid-sized businesses (clinics, dental, beauty/salons, trades, solicitors, accountants). UK only. Limited companies, not sole traders. Not big national chains.
Rules that never bend:
- Use web search. Never invent a business, link, review, quote, name or number. Every proof link must be a page you actually found in this search.
- Only public business contact details (a business email from their website). Never personal phone numbers or home addresses.
- Throw out a lead if: the business is closed or not real, the proof doesn't say what you claim, the signal is older than 60 days, it's a big chain or franchise, it clearly already has this solved, or it's too small to pay.
- Score each survivor 1–10 on budget (can they pay), fit (does our service fix their problem) and timing (do they need it now); "score" is the average, rounded.`;

type Found = { business: string; website: string; email: string; city: string; industry: string; signal: string; proof_url: string; proof_date: string; score: number; why: string; opener: string };

function parse(text: string): Found[] {
  const m = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/(\[\s*\{[\s\S]*\}\s*\])/);
  if (!m) return [];
  try {
    const data = JSON.parse(m[1]);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function runHunter(): Promise<{ added: number; log: string[] }> {
  if (!claudeEnabled()) return { added: 0, log: ["Signal hunter off: add ANTHROPIC_API_KEY."] };
  const limit = env.hunterDailyLimit;
  const today = await findLeads(`AND({Source}='Signal Hunter', IS_SAME(CREATED_TIME(), TODAY(), 'day'))`);
  if (today.length >= limit) return { added: 0, log: [`Signal hunter already found ${today.length} today.`] };
  const all = await listLeads();
  const knownEmails = new Set(all.map((r) => (r.fields.Email ?? "").toLowerCase()));
  const knownSites = new Set(all.map((r) => (r.fields.Website ?? "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0].toLowerCase()).filter(Boolean));
  const knownNames = all.map((r) => r.fields.Company || r.fields.Name).filter(Boolean).slice(-150);

  // Rotate the signal type and the area each day so the hunt keeps finding new businesses.
  const day = Math.floor(Date.now() / 86_400_000);
  const signal = SIGNALS[day % SIGNALS.length];
  const areas = env.hunterAreas.split(";").map((a) => a.trim()).filter(Boolean);
  const area = areas[day % areas.length] ?? "United Kingdom";

  const prompt = `Find up to ${limit - today.length + 3} businesses in ${area} showing this buying signal: ${signal}.
For each, find their website and a public business email on it (contact page). Skip any without an email.
Skip these businesses we already have: ${knownNames.join("; ").slice(0, 3000) || "none"}.
Then answer with ONLY a JSON array in a \`\`\`json block. Each item: {"business","website","email","city","industry","signal" (one line: what you found),"proof_url","proof_date" (YYYY-MM-DD),"score" (1-10),"why" (one sentence: why they'll pay),"opener" (one natural sentence referencing the specific thing you found, written to the owner, no flattery)}.`;
  const text = await claudeResearch(SYSTEM, prompt, 15);
  const found = parse(text).filter((f) => f && f.email && f.business && Number(f.score) >= env.hunterMinScore);

  let added = 0;
  for (const f of found) {
    if (today.length + added >= limit) break;
    const email = f.email.toLowerCase().trim();
    const site = (f.website ?? "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0].toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || knownEmails.has(email) || (site && knownSites.has(site)) || /gmail|hotmail|outlook|yahoo|icloud/.test(email)) continue;
    const score = Math.round(Number(f.score));
    const id = await createLead({
      Name: f.business, Company: f.business, Email: email, Website: f.website, Industry: f.industry,
      Source: "Signal Hunter", Status: "New", Score: score >= 8 ? "Hot" : "Warm", "Score Reason": `${score}/10 · ${f.why}`,
      Summary: f.signal, Created: new Date().toISOString(),
      Notes: [`Signal: ${f.signal}`, `Proof: ${f.proof_url}${f.proof_date ? ` (${f.proof_date})` : ""}`, f.city && `Location: ${f.city}`, f.opener && `Opening line idea: ${f.opener}`].filter(Boolean).join("\n"),
    });
    if (id) { added++; knownEmails.add(email); if (site) knownSites.add(site); }
  }
  return { added, log: [`Signal hunter (${area}): ${found.length} strong leads found, ${added} added.`] };
}
