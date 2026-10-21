import "server-only";
import { activity } from "./work";
import type { SessionUser } from "./auth";

export async function track(u: SessionUser, action: string, target: string, link = "") {
  try { await activity.insert({ user_id: u.id, user_name: u.name, action, target, link }); } catch (e) { console.error("[activity]", e); }
}
