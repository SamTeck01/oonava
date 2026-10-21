import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/automation/env";
import { teamDbEnabled } from "./db";
import { users, findUserByEmail, getUser, verifyPassword, can, type Permission, type User } from "./team";

const COOKIE = "oonava_admin";
const DAYS = 7;
const OWNER_EMAIL = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();

export type SessionUser = { id: string; name: string; email: string; title: string; permissions: Permission[] };

// Owner "master key" from env (ADMIN_EMAIL + ADMIN_PASSWORD) always works, even before Supabase exists.
const ownerConfigured = () => OWNER_EMAIL.includes("@") && env.adminPassword.length >= 8;
const OWNER: SessionUser = { id: "owner", name: "Owner", email: OWNER_EMAIL, title: "Owner", permissions: ["admin"] };

// Sample team logins only on sample data, never in production unless explicitly allowed, never with real leads.
export const demoLoginAllowed = () => !teamDbEnabled() && (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "true");
export const loginConfigured = () => ownerConfigured() || teamDbEnabled() || demoLoginAllowed();

const key = () => `${env.adminPassword}|${env.secret || "oonava"}`;
const sign = (v: string) => createHmac("sha256", key()).update(v).digest("hex");
function safeEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const e = email.toLowerCase().trim();
  if (ownerConfigured() && e === OWNER_EMAIL && safeEqual(sign(password), sign(env.adminPassword))) return OWNER;
  if (!teamDbEnabled() && !demoLoginAllowed()) return null;
  const u = await findUserByEmail(e);
  if (!u || !u.active || !verifyPassword(password, u.password_hash)) return null;
  await users.update(u.id, { last_login: new Date().toISOString() });
  return toSession(u);
}

const toSession = (u: User): SessionUser => ({ id: u.id, name: u.name, email: u.email, title: u.title, permissions: u.permissions });

export async function startSession(uid: string) {
  const v = `${uid}|${Date.now() + DAYS * 86_400_000}`;
  (await cookies()).set(COOKIE, `${Buffer.from(v).toString("base64url")}.${sign(v)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DAYS * 86_400 });
}

export async function endSession() { (await cookies()).delete(COOKIE); }

export async function currentUser(): Promise<SessionUser | null> {
  if (!loginConfigured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value ?? "";
  const [b64, mac] = raw.split(".");
  if (!b64 || !mac) return null;
  const v = Buffer.from(b64, "base64url").toString();
  if (!safeEqual(mac, sign(v))) return null;
  const [uid, exp] = v.split("|");
  if (Number(exp) < Date.now()) return null;
  if (uid === "owner") return ownerConfigured() ? OWNER : null;
  const u = await getUser(uid);
  return u && u.active ? toSession(u) : null; // deactivated users lose access immediately
}

export async function requireUser(perm?: Permission): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (perm && !can(u, perm)) redirect("/admin?denied=1");
  return u;
}

// Throwing variant for server actions called from client components.
export async function assertPerm(perm?: Permission): Promise<SessionUser> {
  const u = await currentUser();
  if (!u || (perm && !can(u, perm))) throw new Error("Not allowed");
  return u;
}

export async function requireAny(perms: Permission[]): Promise<SessionUser> {
  const u = await requireUser();
  if (!perms.some((p) => can(u, p))) redirect("/admin?denied=1");
  return u;
}
