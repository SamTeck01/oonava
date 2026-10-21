"use client";

import { useState, useTransition } from "react";
import { testConnection } from "@/lib/admin/work-actions";

export default function ConnectionTest({ id }: { id: "airtable" | "resend" }) {
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button onClick={() => start(async () => setRes(await testConnection(id)))} disabled={pending} className="btn btn-line min-h-10">{pending ? "Testing…" : "Test"}</button>
      {res && <p className={`w-full text-sm ${res.ok ? "text-[#146c2e]" : "text-[#c8322f]"}`}>{res.text}</p>}
    </>
  );
}
