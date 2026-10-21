export const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("en-GB");

export function ago(iso: string) {
  if (!iso) return "";
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const STATUS_STYLE: Record<string, string> = {
  New: "bg-[#0b6fc0] text-white",
  Contacted: "bg-[#e8f1fb] text-[#0b5a9c]",
  Replied: "bg-[#fff2d6] text-[#7a4b00]",
  Booked: "bg-[#e3f6e8] text-[#146c2e]",
  Proposal: "bg-[#efe8fb] text-[#5b2fa0]",
  Won: "bg-[#146c2e] text-white",
  Lost: "bg-surface text-muted",
  Unsubscribed: "bg-surface text-muted",
};

export const SCORE_STYLE: Record<string, string> = {
  Hot: "bg-[#c8322f] text-white",
  Warm: "bg-[#fff2d6] text-[#7a4b00]",
  Cold: "bg-surface text-muted",
};

export const OPEN = ["New", "Contacted", "Replied", "Booked", "Proposal"];
