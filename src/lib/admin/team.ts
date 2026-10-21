import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { makeTable, type Row } from "./db";
import { seed } from "./seed";

export const PERMISSIONS = [
  { id: "admin", label: "Admin", hint: "Everything, including managing the team" },
  { id: "sales", label: "Sales", hint: "Leads, pipeline, proposals, mark as won" },
  { id: "outreach", label: "Outreach", hint: "Outreach desk: calls, emails, outcomes" },
  { id: "delivery", label: "Delivery", hint: "Client projects, build checklists, tool links" },
  { id: "finance", label: "Finance", hint: "Invoices, payments, revenue numbers" },
  { id: "marketing", label: "Marketing", hint: "Lead imports, sources and lead stats" },
] as const;
export type Permission = (typeof PERMISSIONS)[number]["id"];

export type UserStatus = "pending" | "active" | "disabled";
export type User = Row & {
  name: string;
  email: string;
  title: string;
  permissions: Permission[];
  status: UserStatus;
  password_hash?: string | null; // only used for sample data; real passwords live in Supabase Auth
  last_login?: string | null;
};

// Emails that become admin automatically when they sign up (the first admin).
export const bootstrapAdmins = () => (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);

export const users = makeTable<User>("team_users", seed);

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const can = (u: { permissions: Permission[] } | null | undefined, p: Permission) => !!u && (u.permissions.includes("admin") || u.permissions.includes(p));

// Airtable omits empty fields (unticked checkbox, empty multi-select), so normalise.
export const normalise = (u: User): User => ({ ...u, permissions: (u.permissions ?? []) as Permission[], status: (u.status ?? "pending") as UserStatus, title: u.title ?? "" });

export async function findUserByEmail(email: string) {
  const rows = await users.where("email", email.toLowerCase().trim());
  return rows[0] ? normalise(rows[0]) : null;
}

export async function getUser(id: string) {
  const u = await users.get(id);
  return u ? normalise(u) : null;
}

export async function allUsers() {
  return (await users.all("name.asc")).map(normalise);
}

export const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, title: u.title, permissions: u.permissions, status: u.status, active: u.status === "active", last_login: u.last_login ?? null, created_at: u.created_at ?? "" });
export type PublicUser = ReturnType<typeof publicUser>;
