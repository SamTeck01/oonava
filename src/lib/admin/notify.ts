import "server-only";
import { sendEmail, layout } from "@/lib/automation/email";
import { env } from "@/lib/automation/env";
import { allUsers, type User } from "./team";

// Team notifications go to people's personal email (work logins like fel@oonava.com have no mailbox).
const link = (path: string) => `${env.siteUrl}${path}`;

export async function notify(to: Pick<User, "name" | "personal_email"> | null | undefined, subject: string, body: string, cta?: { label: string; path: string }) {
  const address = to?.personal_email?.trim();
  if (!address) return false;
  try {
    const mail = layout({ name: to!.name, body, cta: cta ? { label: cta.label, url: link(cta.path) } : undefined });
    return await sendEmail({ to: address, subject: `Oonava · ${subject}`, ...mail });
  } catch (e) {
    console.error("[notify]", e);
    return false;
  }
}

export async function notifyAdmins(subject: string, body: string, cta?: { label: string; path: string }, except?: string) {
  const admins = (await allUsers()).filter((u) => u.status === "active" && u.permissions.includes("admin") && u.id !== except);
  await Promise.all(admins.map((a) => notify(a, subject, body, cta)));
}
