import { STATUS_STYLE, SCORE_STYLE } from "@/lib/admin/format";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-surface"}`}>{status}</span>;
}

export function ScoreBadge({ score }: { score: string }) {
  if (!score) return null;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${SCORE_STYLE[score] ?? "bg-surface"}`}>{score.toUpperCase()}</span>;
}

export function Panel({ title, children, action, className = "" }: { title?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[20px] border border-line bg-bg p-5 md:p-6 ${className}`}>
      {(title || action) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function SampleTag({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return <span title="Sample data for testing, not real" className="inline-flex rounded-full border border-dashed border-[#b07d00] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7a4b00]">Sample</span>;
}
