"use client";

import { useState, useTransition } from "react";
import { importCsv } from "@/lib/admin/actions";

export default function ImportCsv({ people }: { people: { email: string; name: string }[] }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("Gemini Spark");
  const [assign, setAssign] = useState("");
  const [result, setResult] = useState<string>("");
  const [busy, start] = useTransition();

  const onFile = async (f: File | undefined) => { if (f) setText(await f.text()); };
  const run = () => start(async () => {
    const r = await importCsv(text, source, assign);
    setResult(r.error ? r.error : `Imported ${r.added} lead${r.added === 1 ? "" : "s"}${r.skipped ? `, skipped ${r.skipped} (missing or invalid email)` : ""}.`);
    if (!r.error) setText("");
  });

  return (
    <section className="space-y-3 rounded-[20px] border border-line bg-bg p-5 md:p-6">
      <h2 className="font-semibold">Import a list (CSV)</h2>
      <p className="text-sm text-muted">Export your Google Sheet as CSV. The first row must be column names. We look for <b>name, email</b> and optionally <b>company, phone, industry, website, city, notes</b>. Up to 500 rows at a time.</p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-fg file:px-4 file:py-2 file:text-bg" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={"name,email,company,city\nJane Doe,jane@agency.com,Doe Homes,Manchester"} className="w-full rounded-xl border border-line bg-bg p-3 font-mono text-xs" />
      <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Source</span>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-bg px-3"><option>Gemini Spark</option><option>LinkedIn</option><option>Event</option><option>Import</option></select>
      </label>
      <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">Assign all to</span>
        <select value={assign} onChange={(e) => setAssign(e.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-bg px-3"><option value="">Nobody (shared outreach queue)</option>{people.map((p) => <option key={p.email} value={p.email}>{p.name}</option>)}</select>
      </label>
      <button type="button" onClick={run} disabled={busy || !text.trim()} className="btn btn-dark w-full">{busy ? "Importing…" : "Import leads"}</button>
      {result && <p className="text-sm">{result}</p>}
      <p className="text-xs text-muted">Imported leads are not emailed automatically. Use &quot;Cold outreach&quot; on each lead, and only contact business addresses, with the unsubscribe link we add.</p>
    </section>
  );
}
