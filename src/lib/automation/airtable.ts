import { env } from "./env";

// Field names must match the Airtable "Leads" table (see docs/automation.md).
export type LeadRecord = {
  Name: string;
  Email: string;
  Company?: string;
  Phone?: string;
  Message?: string;
  Source?: string;
  Summary?: string;
  Industry?: string;
  "Recommended Tier"?: string;
  Score?: string;
  "Score Reason"?: string;
  "Reply Sent"?: string;
  Status?: "New" | "Contacted" | "Replied" | "Booked" | "Won" | "Lost" | "Unsubscribed";
  "Follow-ups Sent"?: number;
  "First Contacted"?: string;
  "Last Contacted"?: string;
};

const enabled = () => Boolean(env.airtableToken && env.airtableBase);
const url = (suffix = "") => `https://api.airtable.com/v0/${env.airtableBase}/${encodeURIComponent(env.airtableTable)}${suffix}`;
const headers = () => ({ Authorization: `Bearer ${env.airtableToken}`, "Content-Type": "application/json" });

export async function createLead(fields: LeadRecord): Promise<string | null> {
  if (!enabled()) { console.log("[airtable] (not configured)", fields.Email); return null; }
  const res = await fetch(url(), { method: "POST", headers: headers(), body: JSON.stringify({ fields, typecast: true }), signal: AbortSignal.timeout(15000) });
  if (!res.ok) { console.error("[airtable] create", res.status, await res.text()); return null; }
  return (await res.json()).id as string;
}

export async function updateLead(id: string, fields: Partial<LeadRecord>) {
  if (!enabled()) return false;
  const res = await fetch(url(`/${id}`), { method: "PATCH", headers: headers(), body: JSON.stringify({ fields, typecast: true }), signal: AbortSignal.timeout(15000) });
  if (!res.ok) console.error("[airtable] update", res.status, await res.text());
  return res.ok;
}

export async function findLeads(formula: string): Promise<{ id: string; fields: LeadRecord }[]> {
  if (!enabled()) return [];
  const out: { id: string; fields: LeadRecord }[] = [];
  let offset = "";
  do {
    const q = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
    if (offset) q.set("offset", offset);
    const res = await fetch(url(`?${q}`), { headers: headers(), signal: AbortSignal.timeout(15000) });
    if (!res.ok) { console.error("[airtable] list", res.status, await res.text()); break; }
    const data = await res.json();
    out.push(...data.records);
    offset = data.offset ?? "";
  } while (offset && out.length < 1000);
  return out;
}

export const escapeFormula = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
