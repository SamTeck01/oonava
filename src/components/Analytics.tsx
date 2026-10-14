"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

// Conversion events. No-ops until the visitor accepts cookies and the IDs are set.
export function track(event: "lead" | "demo_tried" | "estimate_done") {
  const w = window as W;
  w.gtag?.("event", event === "lead" ? "generate_lead" : event);
  if (event === "lead") w.fbq?.("track", "Lead");
  else w.fbq?.("trackCustom", event);
}

// Loads Google Analytics and the Meta pixel only after consent (GDPR / UK PECR).
export default function Analytics() {
  const [consent, setConsent] = useState<"yes" | "no" | null | "unknown">("unknown");

  useEffect(() => {
    try { const c = localStorage.getItem("consent"); setConsent(c === "yes" || c === "no" ? c : null); } catch { setConsent(null); }
  }, []);

  if (!GA && !PIXEL) return null;
  const choose = (c: "yes" | "no") => { try { localStorage.setItem("consent", c); } catch {} setConsent(c); };

  return (
    <>
      {consent === null && (
        <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl rounded-2xl border border-line bg-bg p-5 shadow-lg md:p-6">
          <p className="text-sm">We use cookies to measure our ads and improve the site. Nothing is loaded unless you accept. <a href="/privacy" className="underline">Privacy policy</a></p>
          <div className="mt-4 flex gap-3">
            <button className="btn btn-dark !py-2" onClick={() => choose("yes")}>Accept</button>
            <button className="btn btn-line !py-2" onClick={() => choose("no")}>Decline</button>
          </div>
        </div>
      )}
      {consent === "yes" && GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}');`}</Script>
        </>
      )}
      {consent === "yes" && PIXEL && (
        <Script id="pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
