import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

export const sign = (id: string) => createHmac("sha256", env.secret || "dev").update(id).digest("hex").slice(0, 32);

export function verify(id: string, token: string) {
  const a = Buffer.from(sign(id));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const unsubscribeUrl = (id: string) => `${env.siteUrl}/api/unsubscribe?id=${encodeURIComponent(id)}&t=${sign(id)}`;
