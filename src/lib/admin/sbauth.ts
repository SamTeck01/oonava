import "server-only";

// Supabase Auth (GoTrue) admin calls with the service-role key, server-side only.
// Users are created already confirmed, so no confirmation email is ever sent
// (team logins like delight@oonava.com don't need a real mailbox).
const URL_ = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const supabaseAuthEnabled = () => Boolean(URL_ && KEY);

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${URL_}/auth/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

export async function createAuthUser(email: string, password: string): Promise<{ id?: string; error?: string }> {
  const r = await call("admin/users", { method: "POST", body: JSON.stringify({ email, password, email_confirm: true }) });
  if (r.ok) return { id: r.body.id };
  const msg = String(r.body.msg ?? r.body.message ?? r.body.error_description ?? "");
  if (r.status === 422 && /already|registered|exists/i.test(msg)) return { error: "An account with that email already exists." };
  if (/password/i.test(msg)) return { error: msg };
  console.error("[sbauth] create", r.status, msg);
  return { error: "Could not create the account. Try again later." };
}

export async function signInAuth(email: string, password: string): Promise<string | null> {
  const r = await call("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  return r.ok ? (r.body.user?.id ?? null) : null;
}

export async function setAuthPassword(id: string, password: string) {
  const r = await call(`admin/users/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ password }) });
  if (!r.ok) console.error("[sbauth] set password", r.status, r.body);
  return r.ok;
}

export async function deleteAuthUser(id: string) {
  const r = await call(`admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  return r.ok;
}
