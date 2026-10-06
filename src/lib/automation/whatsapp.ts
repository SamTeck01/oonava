import { env } from "./env";

// Team alerts via CallMeBot (free WhatsApp API for messaging your own number).
export async function alertTeam(message: string) {
  if (!env.whatsappPhone || !env.whatsappKey) { console.log("[whatsapp] (not configured)\n" + message); return false; }
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.whatsappPhone)}&text=${encodeURIComponent(message.slice(0, 1500))}&apikey=${encodeURIComponent(env.whatsappKey)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) console.error("[whatsapp]", res.status);
    return res.ok;
  } catch (e) {
    console.error("[whatsapp]", e);
    return false;
  }
}
