import type { Faq as F } from "@/lib/content";

export default function Faq({ items }: { items: F[] }) {
  return (
    <div className="faq divide-y divide-line border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="reveal group py-6 md:py-7">
          <summary className="flex items-start gap-5">
            <span className="dash mt-[.7em] h-[2px] w-5 shrink-0 bg-accent" aria-hidden />
            <span className="h4 flex-1">{f.q}</span>
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-lg transition-transform duration-500 group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <div className="ans">
            <div className="overflow-hidden">
              <p className="max-w-2xl pt-4 pl-10 text-muted">{f.a}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
