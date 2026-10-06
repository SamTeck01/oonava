"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer for every .reveal / .line-mask element; Lenis only on fine pointers.
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;
    let id = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const l = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis = l;
      const raf = (t: number) => { l.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
    });
    return () => { cancelled = true; cancelAnimationFrame(id); lenis?.destroy(); };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-in), [data-reveal]:not(.is-in)");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
