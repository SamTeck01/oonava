import "server-only";
import { airtableEnabled, createLead as atCreate, getLead as atGet, listLeads as atList, updateLead as atUpdate, type LeadRecord, type LeadStatus } from "@/lib/automation/airtable";
import { tiers } from "@/lib/content";
import { demoLeads, demoProspects } from "./demo";

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  source: string;
  summary: string;
  industry: string;
  tier: string;
  score: "Hot" | "Warm" | "Cold" | "";
  scoreReason: string;
  replySent: string;
  status: LeadStatus;
  followUps: number;
  firstContacted: string;
  lastContacted: string;
  notes: string;
  activity: string;
  dealValue: number;
  monthlyValue: number;
  nextAction: string;
  created: string;
  assignedTo: string;
};

// Sample leads only while testing. On the live site without Airtable the pipeline is simply empty.
const sampleAllowed = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "true";
export const isDemo = () => !airtableEnabled() && sampleAllowed();
export const leadsConnected = () => airtableEnabled();

function fromRecord(r: { id: string; fields: LeadRecord; createdTime?: string }): Lead {
  const f = r.fields;
  return {
    id: r.id, name: f.Name ?? "(no name)", email: f.Email ?? "", company: f.Company ?? "", phone: f.Phone ?? "",
    message: f.Message ?? "", source: f.Source ?? "", summary: f.Summary ?? "", industry: f.Industry ?? "",
    tier: f["Recommended Tier"] ?? "", score: (f.Score as Lead["score"]) ?? "", scoreReason: f["Score Reason"] ?? "",
    replySent: f["Reply Sent"] ?? "", status: f.Status ?? "New", followUps: f["Follow-ups Sent"] ?? 0,
    firstContacted: f["First Contacted"] ?? "", lastContacted: f["Last Contacted"] ?? "", notes: f.Notes ?? "",
    activity: f.Activity ?? "", dealValue: f["Deal Value"] ?? 0, monthlyValue: f["Monthly Value"] ?? 0,
    nextAction: f["Next Action"] ?? "", created: f.Created ?? r.createdTime ?? "", assignedTo: f["Assigned To"] ?? "",
  };
}

const FIELD: Partial<Record<keyof Lead, keyof LeadRecord>> = {
  name: "Name", email: "Email", company: "Company", phone: "Phone", message: "Message", source: "Source",
  summary: "Summary", industry: "Industry", tier: "Recommended Tier", score: "Score", status: "Status",
  notes: "Notes", activity: "Activity", dealValue: "Deal Value", monthlyValue: "Monthly Value",
  nextAction: "Next Action", lastContacted: "Last Contacted", firstContacted: "First Contacted", assignedTo: "Assigned To", followUps: "Follow-ups Sent",
};

function toRecord(patch: Partial<Lead>): Partial<LeadRecord> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    const f = FIELD[k as keyof Lead];
    if (f && v !== undefined) out[f] = v === "" && (k === "nextAction") ? null : v;
  }
  return out as Partial<LeadRecord>;
}

// In-memory sample data until Airtable is connected (resets on redeploy).
const g = globalThis as unknown as { __oonavaDemo?: Lead[] };
const demo = () => (g.__oonavaDemo ??= [
  ...demoLeads(),
  ...demoProspects().map((p, i) => ({ ...blank(), ...p, id: `demo_p${i}`, created: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(), activity: "" }) as Lead),
]);

export async function listLeads(): Promise<Lead[]> {
  if (!airtableEnabled() && !isDemo()) return [];
  const rows = isDemo() ? [...demo()] : (await atList()).map(fromRecord);
  return rows.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
}

export async function getLead(id: string): Promise<Lead | null> {
  if (isDemo()) return demo().find((l) => l.id === id) ?? null;
  if (!airtableEnabled()) return null;
  const r = await atGet(id);
  return r ? fromRecord(r) : null;
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  if (isDemo()) {
    const l = demo().find((x) => x.id === id);
    if (l) Object.assign(l, patch);
    return Boolean(l);
  }
  if (!airtableEnabled()) return false;
  return atUpdate(id, toRecord(patch));
}

export async function createLead(data: Partial<Lead> & { name: string; email: string }) {
  const now = new Date().toISOString();
  if (isDemo()) {
    const l: Lead = { ...blank(), ...data, id: `demo_${Math.random().toString(36).slice(2, 9)}`, created: now };
    demo().unshift(l);
    return l.id;
  }
  if (!airtableEnabled()) return null;
  return atCreate({ ...(toRecord(data) as LeadRecord), Status: data.status ?? "New", "Follow-ups Sent": 0 });
}

export async function logActivity(lead: Lead, text: string) {
  const line = `${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${text}`;
  await updateLead(lead.id, { activity: lead.activity ? `${line}\n${lead.activity}` : line });
}

export function blank(): Lead {
  return { id: "", name: "", email: "", company: "", phone: "", message: "", source: "Manual", summary: "", industry: "", tier: "", score: "", scoreReason: "", replySent: "", status: "New", followUps: 0, firstContacted: "", lastContacted: "", notes: "", activity: "", dealValue: 0, monthlyValue: 0, nextAction: "", created: "", assignedTo: "" };
}

// Value used for pipeline maths: the agreed deal value, otherwise the recommended package's setup fee.
export function estimatedValue(l: Lead) {
  if (l.dealValue) return l.dealValue;
  const t = tiers.find((x) => x.name === l.tier);
  return t ? t.setup.eur : 0;
}

export function monthlyFor(l: Lead) {
  if (l.monthlyValue) return l.monthlyValue;
  const t = tiers.find((x) => x.name === l.tier);
  return t ? t.monthly.eur : 0;
}
