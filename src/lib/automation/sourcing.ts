import "server-only";
import { env } from "./env";
import { createLead, findLeads, listLeads } from "./airtable";

// Finds new B2B prospects every day and adds them to the pipeline as "New", where auto-outreach picks them up.
// Sources: Google Maps (local businesses + the email on their website) and Apollo (named decision-makers).

const DAY = 86_400_000;
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const JUNK_EMAIL = /(example|sentry|wixpress|domain\.com|yourdomain|email\.com|\.png|\.jpg|\.gif|\.webp|noreply|no-reply|privacy|gdpr|abuse)/i;
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };

type Prospect = { name: string; email: string; company: string; phone?: string; industry: string; website?: string; notes: string; source: "Google Maps" | "Apollo" };

async function fetchText(url: string) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; OonavaBot/1.0; +https://oonava.com)" }, signal: AbortSignal.timeout(8000), redirect: "follow" });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return "";
    return (await res.text()).slice(0, 400_000);
  } catch { return ""; }
}

// Read the homepage and contact page; prefer an address on the company's own domain, and a named one over info@.
async function siteDetails(site: string) {
  const domain = host(site);
  const base = site.replace(/\/$/, "");
  const pages = [await fetchText(base)];
  for (const p of ["/contact", "/contact-us"]) { if (pages.join("").match(EMAIL)?.some((e) => e.toLowerCase().endsWith(domain))) break; pages.push(await fetchText(base + p)); }
  const html = pages.join("\n");
  const emails = [...new Set((html.replace(/mailto:/gi, " ").match(EMAIL) ?? []).map((e) => e.toLowerCase()))].filter((e) => !JUNK_EMAIL.test(e));
  const own = emails.filter((e) => e.endsWith(domain));
  const pick = own.find((e) => !/^(info|hello|enquiries|contact|sales|office|admin|lettings|mail)@/.test(e)) ?? own[0] ?? null;
  const title = (pages[0].match(/<title[^>]*>([^<]{3,140})/i)?.[1] ?? "").trim();
  const desc = (pages[0].match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,300})/i)?.[1] ?? "").trim();
  return { email: pick, about: [title, desc].filter(Boolean).join(" · ") };
}

async function fromGoogleMaps(limit: number, known: Set<string>, knownDomains: Set<string>): Promise<Prospect[]> {
  const queries = env.sourcingQueries.split(";").map((q) => q.trim()).filter(Boolean);
  if (!env.placesKey || !queries.length || limit <= 0) return [];
  // Rotate through the queries, one per day, so the whole list gets covered over time.
  const q = queries[Math.floor(Date.now() / DAY) % queries.length];
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.placesKey, "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.nationalPhoneNumber,places.formattedAddress,places.primaryTypeDisplayName,places.businessStatus" },
    body: JSON.stringify({ textQuery: q, pageSize: 20, regionCode: "GB" }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) { console.error("[sourcing] places", res.status, await res.text()); return []; }
  const places: { displayName?: { text: string }; websiteUri?: string; nationalPhoneNumber?: string; formattedAddress?: string; primaryTypeDisplayName?: { text: string }; businessStatus?: string }[] = (await res.json()).places ?? [];
  const out: Prospect[] = [];
  for (const p of places) {
    if (out.length >= limit) break;
    if (!p.websiteUri || p.businessStatus === "CLOSED_PERMANENTLY" || knownDomains.has(host(p.websiteUri))) continue;
    const { email, about } = await siteDetails(p.websiteUri);
    if (!email || known.has(email)) continue;
    const company = p.displayName?.text ?? host(p.websiteUri);
    out.push({ name: company, email, company, phone: p.nationalPhoneNumber, industry: p.primaryTypeDisplayName?.text ?? q, website: p.websiteUri, source: "Google Maps",
      notes: [`Found via Google Maps search: "${q}"`, p.formattedAddress && `Address: ${p.formattedAddress}`, about && `Website says: ${about}`].filter(Boolean).join("\n") });
    known.add(email); knownDomains.add(host(p.websiteUri));
  }
  return out;
}

async function fromApollo(limit: number, known: Set<string>, knownDomains: Set<string>): Promise<Prospect[]> {
  if (!env.apolloKey || limit <= 0) return [];
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": env.apolloKey };
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const page = (Math.floor(Date.now() / DAY) % 50) + 1;
  const res = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
    method: "POST", headers, signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ person_titles: list(env.apolloTitles), person_locations: list(env.apolloLocations), q_organization_keyword_tags: list(env.apolloKeywords), organization_num_employees_ranges: ["1,10", "11,50", "51,200"], page, per_page: 25 }),
  });
  if (!res.ok) { console.error("[sourcing] apollo search", res.status, await res.text()); return []; }
  const people: { id: string; first_name?: string; last_name?: string; name?: string; title?: string; organization?: { name?: string; website_url?: string; industry?: string; primary_domain?: string } }[] = (await res.json()).people ?? [];
  const out: Prospect[] = [];
  for (const p of people) {
    if (out.length >= limit) break;
    const domain = p.organization?.primary_domain ?? host(p.organization?.website_url ?? "");
    if (domain && knownDomains.has(domain)) continue;
    // Revealing the work email uses one Apollo credit, so only do it for people we'll actually add.
    const m = await fetch("https://api.apollo.io/api/v1/people/match", { method: "POST", headers, signal: AbortSignal.timeout(20000), body: JSON.stringify({ id: p.id, reveal_personal_emails: false }) });
    if (!m.ok) continue;
    const person = (await m.json()).person ?? {};
    const email = (person.email ?? "").toLowerCase();
    if (!email || person.email_status === "unavailable" || person.email_status === "invalid" || known.has(email) || JUNK_EMAIL.test(email)) continue;
    const company = p.organization?.name ?? "";
    out.push({ name: p.name ?? [p.first_name, p.last_name].filter(Boolean).join(" "), email, company, industry: p.organization?.industry ?? env.apolloKeywords, website: p.organization?.website_url, source: "Apollo",
      notes: [`${p.title ?? "Decision-maker"} at ${company}`, `Found via Apollo (${env.apolloKeywords}, ${env.apolloLocations})`].join("\n") });
    known.add(email); if (domain) knownDomains.add(domain);
  }
  return out;
}

// Adds up to SOURCING_DAILY_LIMIT new prospects a day, split between the sources that are connected.
export async function runSourcing() {
  const already = await findLeads(`AND(OR({Source}='Google Maps',{Source}='Apollo'), IS_SAME(CREATED_TIME(), TODAY(), 'day'))`);
  let room = env.sourcingDailyLimit - already.length;
  if (room <= 0) return { added: 0, log: [`Daily sourcing limit reached (${already.length}/${env.sourcingDailyLimit}).`] };
  const all = await listLeads();
  const known = new Set(all.map((r) => (r.fields.Email ?? "").toLowerCase()).filter(Boolean));
  const knownDomains = new Set(all.flatMap((r) => [host(r.fields.Website ?? ""), (r.fields.Email ?? "").split("@")[1]?.toLowerCase() ?? ""]).filter((d) => d && !/gmail|outlook|hotmail|yahoo|icloud|live\./.test(d)));
  const sources = [env.apolloKey && "apollo", env.placesKey && env.sourcingQueries && "maps"].filter(Boolean);
  if (!sources.length) return { added: 0, log: ["No lead sources connected (add APOLLO_API_KEY and/or GOOGLE_PLACES_KEY + SOURCING_QUERIES)."] };
  const per = Math.ceil(room / sources.length);
  const found = [...(await fromApollo(Math.min(per, room), known, knownDomains).catch((e) => { console.error(e); return []; }))];
  room -= found.length;
  found.push(...(await fromGoogleMaps(room, known, knownDomains).catch((e) => { console.error(e); return []; })));
  let added = 0;
  for (const p of found) {
    const id = await createLead({ Name: p.name, Email: p.email, Company: p.company, Phone: p.phone, Industry: p.industry, Website: p.website, Notes: p.notes, Source: p.source, Status: "New", Created: new Date().toISOString() });
    if (id) added++;
  }
  return { added, log: [`Added ${added} new leads (${found.filter((p) => p.source === "Apollo").length} Apollo, ${found.filter((p) => p.source === "Google Maps").length} Google Maps).`] };
}
