"use client";

import { useState, useTransition } from "react";
import { runAutomation } from "@/lib/admin/work-actions";

export default function AutomationButton({ kind, label }: { kind: "outreach" | "sourcing" | "inbox" | "mailbox"; label: string }) {
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();
  return (
    <div className="space-y-2">
      <button type="button" disabled={busy} onClick={() => start(async () => setRes(await runAutomation(kind)))} className="btn btn-line min-h-10 w-full">{busy ? "Working…" : label}</button>
      {res && <p className={`text-sm ${res.ok ? "text-[#146c2e]" : "text-muted"}`}>{res.text}</p>}
    </div>
  );
}
