import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/automation/env";
import { supabaseAuthEnabled, signInAuth } from "./sbauth";
import { users, findUserByEmail, getUser, verifyPassword, can, type Permission, type User } from "./team";

const COOKIE = "oonava_admin";
const DAYS = 7;

export type SessionUser = { id: string; name: string; email: string; title: string; permissions: Permission[] };

// Accounts live in Supabase Auth. Sample logins only work on sample data, never in production unless explicitly allowed.
export const demoLoginAllowed = () => !supabaseAuthEnabled() && (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "true");
export const loginConfigured = () => supabaseAuthEnabled() || demoLoginAllowed();

const key = () => `${env.secret || "oonava-dev"}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
const sign = (v: string) => createHmac("sha256", key()).update(v).digest("hex");
function safeEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }

const toSession = (u: User): SessionUser => ({ id: u.id, name: u.name, email: u.email, title: u.title, permissions: u.permissions });

export type AuthResult = { user?: SessionUser; pending?: boolean; disabled?: boolean };

export async function authenticate(email: string, password: string): Promise<AuthResult> {
  const e = email.toLowerCase().trim();
  let ok = false;
  const profile = await findUserByEmail(e);
  if (supabaseAuthEnabled()) ok = !!(await signInAuth(e, password));
  else if (demoLoginAllowed()) ok = !!profile?.password_hash && verifyPassword(password, profile.password_hash);
  if (!ok || !profile) return {};
  if (profile.status === "pending") return { pending: true };
  if (profile.status !== "active") return { disabled: true };
  await users.update(profile.id, { last_login: new Date().toISOString() });
  return { user: toSession(profile) };
}

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
  const u = await getUser(uid);
  return u && u.status === "active" ? toSession(u) : null; // disabled users lose access immediately
}

export async function requireUser(perm?: Permission): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (perm && !can(u, perm)) redirect("/admin?denied=1");
  return u;
}

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
