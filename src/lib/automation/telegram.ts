import { env } from "./env";

// Team alerts via a Telegram bot. TELEGRAM_CHAT_IDS is a comma-separated list:
// a team group's id (alerts everyone at once) and/or individual people's ids.
export const telegramChats = () => (env.telegramChats ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export async function sendTelegram(text: string, chats = telegramChats()) {
  if (!env.telegramToken || !chats.length) return false;
  const results = await Promise.all(chats.map(async (chat_id) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${env.telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: text.slice(0, 4000), disable_web_page_preview: true }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) console.error("[telegram]", chat_id, res.status, (await res.text()).slice(0, 200));
      return res.ok;
    } catch (e) {
      console.error("[telegram]", chat_id, e);
      return false;
    }
  }));
  return results.some(Boolean);
}

// Chats that have recently messaged the bot or added it to a group, to help find their ids.
export async function recentTelegramChats(): Promise<{ id: string; name: string }[]> {
  if (!env.telegramToken) return [];
  const res = await fetch(`https://api.telegram.org/bot${env.telegramToken}/getUpdates`, { cache: "no-store", signal: AbortSignal.timeout(15000) }).catch(() => null);
  if (!res?.ok) return [];
  const data = await res.json();
  const seen = new Map<string, string>();
  for (const u of data.result ?? []) {
    const c = (u.message ?? u.my_chat_member ?? u.channel_post)?.chat;
    if (c) seen.set(String(c.id), c.title ?? [c.first_name, c.last_name].filter(Boolean).join(" ") ?? c.username ?? "");
  }
  return [...seen].map(([id, name]) => ({ id, name }));
}
