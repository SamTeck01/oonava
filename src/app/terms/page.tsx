import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

// TODO: replace with reviewed terms before launch.
export default function Terms() {
  return (
    <article className="container-x max-w-3xl pt-36 pb-24 md:pt-48 [&_p]:text-muted [&_p]:mb-4">
      <h1 className="h2 mb-10">Terms of use</h1>
      <p>The content of this website is for general information only. Prices shown exclude VAT and third-party subscription costs. Project scope, price and timelines are confirmed in a written proposal before any work begins.</p>
      <p>Concept demos on this site use sample data and illustrate how our systems work; they are not client results. Calculator outputs are illustrative estimates, not guarantees.</p>
    </article>
  );
}
