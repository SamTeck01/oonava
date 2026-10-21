import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/automation/env";

const COOKIE = "oonava_admin";
const DAYS = 7;

// Login is only possible once ADMIN_PASSWORD is set (no default password in production).
export const adminConfigured = () => env.adminPassword.length >= 8;

const key = () => `${env.adminPassword}|${env.secret || "oonava"}`;
const sign = (v: string) => createHmac("sha256", key()).update(v).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  return adminConfigured() && safeEqual(sign(input), sign(env.adminPassword));
}

export async function startSession() {
  const exp = String(Date.now() + DAYS * 86_400_000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DAYS * 86_400 });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value ?? "";
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(exp));
}

// Call at the top of every admin page and server action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
