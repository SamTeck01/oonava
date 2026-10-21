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
  Status?: LeadStatus;
  "Follow-ups Sent"?: number;
  "First Contacted"?: string;
  "Last Contacted"?: string;
  Notes?: string;
  Activity?: string;
  "Deal Value"?: number;
  "Monthly Value"?: number;
  "Next Action"?: string;
  Created?: string;
};

export const STATUSES = ["New", "Contacted", "Replied", "Booked", "Proposal", "Won", "Lost", "Unsubscribed"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export const airtableEnabled = () => Boolean(env.airtableToken && env.airtableBase);
const url = (suffix = "") => `https://api.airtable.com/v0/${env.airtableBase}/${encodeURIComponent(env.airtableTable)}${suffix}`;
const headers = () => ({ Authorization: `Bearer ${env.airtableToken}`, "Content-Type": "application/json" });

export async function createLead(fields: LeadRecord): Promise<string | null> {
  if (!airtableEnabled()) { console.log("[airtable] (not configured)", fields.Email); return null; }
  const res = await fetch(url(), { method: "POST", headers: headers(), body: JSON.stringify({ fields, typecast: true }), signal: AbortSignal.timeout(15000) });
  if (!res.ok) { console.error("[airtable] create", res.status, await res.text()); return null; }
  return (await res.json()).id as string;
}

export async function updateLead(id: string, fields: Partial<LeadRecord>) {
  if (!airtableEnabled()) return false;
  const res = await fetch(url(`/${id}`), { method: "PATCH", headers: headers(), body: JSON.stringify({ fields, typecast: true }), signal: AbortSignal.timeout(15000) });
  if (!res.ok) console.error("[airtable] update", res.status, await res.text());
  return res.ok;
}

export async function findLeads(formula: string): Promise<{ id: string; fields: LeadRecord; createdTime?: string }[]> {
  if (!airtableEnabled()) return [];
  const out: { id: string; fields: LeadRecord; createdTime?: string }[] = [];
  let offset = "";
  do {
    const q = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
    if (offset) q.set("offset", offset);
    const res = await fetch(url(`?${q}`), { headers: headers(), signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!res.ok) { console.error("[airtable] list", res.status, await res.text()); break; }
    const data = await res.json();
    out.push(...data.records);
    offset = data.offset ?? "";
  } while (offset && out.length < 1000);
  return out;
}

export const escapeFormula = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

export async function getLead(id: string): Promise<{ id: string; fields: LeadRecord; createdTime?: string } | null> {
  if (!airtableEnabled()) return null;
  const res = await fetch(url(`/${encodeURIComponent(id)}`), { headers: headers(), signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function listLeads(): Promise<{ id: string; fields: LeadRecord; createdTime?: string }[]> {
  return findLeads("TRUE()");
}
