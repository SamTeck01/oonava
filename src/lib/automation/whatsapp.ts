import { env } from "./env";
import { sendTelegram } from "./telegram";

// Team alerts via CallMeBot (free WhatsApp API that can only message individual numbers that opted in).
// WHATSAPP_ALERTS = "+447700900001:apikey1,+2348012345678:apikey2" sends to each person.
function recipients() {
  const list = (env.whatsappAlerts ?? "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
    const i = s.lastIndexOf(":");
    return { phone: s.slice(0, i), key: s.slice(i + 1) };
  }).filter((r) => r.phone && r.key);
  if (!list.length && env.whatsappPhone && env.whatsappKey) list.push({ phone: env.whatsappPhone, key: env.whatsappKey });
  return list;
}

async function send(phone: string, key: string, text: string) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text.slice(0, 1500))}&apikey=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) console.error("[whatsapp]", phone.slice(-4), res.status);
    return res.ok;
  } catch (e) {
    console.error("[whatsapp]", phone.slice(-4), e);
    return false;
  }
}

// Alerts go to Telegram (main channel) and to any WhatsApp numbers still configured.
export async function alertTeam(message: string) {
  const to = recipients();
  const [tg, ...wa] = await Promise.all([sendTelegram(message), ...to.map((r) => send(r.phone, r.key, message))]);
  if (!tg && !to.length) console.log("[alerts] (no Telegram or WhatsApp configured)\n" + message);
  return tg || wa.some(Boolean);
}
