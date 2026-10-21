import "server-only";
import { env } from "@/lib/automation/env";

// Team data (users, projects, tasks, invoices, activity) storage, chosen by environment:
//   1. Supabase, if SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set (recommended: fast, no record limits)
//   2. Airtable tables in the Leads base, if AIRTABLE_TOKEN + AIRTABLE_BASE_ID are set
//   3. In-memory sample data otherwise
// Field/column names match the keys used in code (see docs/automation.md and docs/supabase.sql).
const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const backend = (): "supabase" | "airtable" | "memory" => (SB_URL && SB_KEY ? "supabase" : env.airtableToken && env.airtableBase ? "airtable" : "memory");
export const teamDbEnabled = () => backend() !== "memory";

export type Row = Record<string, unknown> & { id: string; created_at?: string };

const TABLES: Record<string, string> = { team_users: "Team", projects: "Projects", tasks: "Tasks", invoices: "Invoices", activity: "Activity" };

const g = globalThis as unknown as { __oonavaTables?: Record<string, Row[]> };
const memory = (seed: () => Record<string, Row[]>) => (g.__oonavaTables ??= seed());

async function at(table: string, path = "", init: RequestInit = {}) {
  const res = await fetch(`https://api.airtable.com/v0/${env.airtableBase}/${encodeURIComponent(TABLES[table])}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.airtableToken}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`[airtable:${TABLES[table]}] ${init.method ?? "GET"} ${res.status}: ${await res.text()}`);
  return res.json();
}

const fromRecord = <T>(r: { id: string; createdTime: string; fields: Record<string, unknown> }) => ({ ...r.fields, id: r.id, created_at: r.createdTime }) as unknown as T;

function toFields(data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) if (k !== "id" && k !== "created_at" && v !== undefined) out[k] = v === "" ? null : v;
  return out;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

async function sb(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers ?? {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`[supabase] ${init.method ?? "GET"} ${path.split("?")[0]} ${res.status}: ${await res.text()}`);
  return res.status === 204 ? [] : res.json();
}
const uri = (v: unknown) => encodeURIComponent(String(v));

export function makeTable<T extends Row>(table: string, seed: () => Record<string, Row[]>) {
  const mem = () => (memory(seed)[table] ??= []) as T[];
  const sortRows = (rows: T[], order: string) => {
    const [col, dir] = order.split(".");
    return rows.sort((a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? "")) * (dir === "desc" ? -1 : 1));
  };
  async function list(formula?: string): Promise<T[]> {
    const out: T[] = [];
    let offset = "";
    do {
      const q = new URLSearchParams({ pageSize: "100" });
      if (formula) q.set("filterByFormula", formula);
      if (offset) q.set("offset", offset);
      const data = await at(table, `?${q}`);
      out.push(...data.records.map(fromRecord<T>));
      offset = data.offset ?? "";
    } while (offset && out.length < 3000);
    return out;
  }
  return {
    async all(order = "created_at.desc"): Promise<T[]> {
      if (backend() === "supabase") return sb(`${table}?select=*&order=${order}&limit=5000`);
      return sortRows(backend() === "airtable" ? await list() : [...mem()], order);
    },
    async where(col: string, val: string): Promise<T[]> {
      if (backend() === "supabase") return sb(`${table}?select=*&${col}=eq.${uri(val)}&order=created_at.desc`);
      if (backend() === "memory") return mem().filter((r) => String(r[col] ?? "") === val);
      return sortRows(await list(`{${col}}='${esc(val)}'`), "created_at.desc");
    },
    async get(id: string): Promise<T | null> {
      if (backend() === "supabase") { if (!/^[0-9a-f-]{36}$/i.test(id)) return null; return (await sb(`${table}?select=*&id=eq.${uri(id)}`))[0] ?? null; }
      if (backend() === "memory") return mem().find((r) => r.id === id) ?? null;
      if (!/^rec[A-Za-z0-9]+$/.test(id)) return null;
      try { return fromRecord<T>(await at(table, `/${id}`)); } catch { return null; }
    },
    async insert(data: Partial<T>): Promise<T> {
      if (backend() === "supabase") return (await sb(table, { method: "POST", body: JSON.stringify(data) }))[0];
      if (backend() === "memory") {
        const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as T;
        mem().unshift(row);
        return row;
      }
      return fromRecord<T>(await at(table, "", { method: "POST", body: JSON.stringify({ fields: toFields(data), typecast: true }) }));
    },
    async update(id: string, patch: Partial<T>) {
      if (backend() === "supabase") { await sb(`${table}?id=eq.${uri(id)}`, { method: "PATCH", body: JSON.stringify(patch) }); return; }
      if (backend() === "memory") { const r = mem().find((x) => x.id === id); if (r) Object.assign(r, patch); return; }
      await at(table, `/${id}`, { method: "PATCH", body: JSON.stringify({ fields: toFields(patch), typecast: true }) });
    },
    async remove(id: string) {
      if (backend() === "supabase") { await sb(`${table}?id=eq.${uri(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }); return; }
      if (backend() === "memory") { const m = mem(); const i = m.findIndex((x) => x.id === id); if (i >= 0) m.splice(i, 1); return; }
      await at(table, `/${id}`, { method: "DELETE" });
    },
  };
}
