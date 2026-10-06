import type { Metadata } from "next";
import { PageHero, Split, Btn } from "@/components/Ui";

export const metadata: Metadata = { title: "About", description: "Oonava is a small, senior team building AI automation and custom systems." };

// TODO: replace roles/bios with final copy and add photos from Kelly.
const team = [
  { name: "Kelly", role: "Founder · Client partnerships", bio: "Leads client relationships and makes sure every project starts with the business problem, not the technology." },
  { name: "Samad", role: "Software & AI engineering", bio: "Six years building production web systems in TypeScript, Node.js and Postgres. Leads integrations, custom software and AI implementation." },
  { name: "Delight", role: "Automation & CRM systems", bio: "Designs and builds the workflows and CRM systems that run behind the scenes." },
];

const values = [
  ["Outcomes over tools", "We talk about replies, bookings and hours saved, not which app we used."],
  ["Honest scope", "If something isn't worth automating, we'll say so."],
  ["Built to last", "Error handling, logs and documentation are part of every build, not extras."],
  ["People in the loop", "Automation handles the routine. Your team handles the relationships."],
];

export default function About() {
  return (
    <>
      <PageHero eyebrow="About" title={["We build the systems", "that run behind", "your business."]} lead="Oonava is an AI automation and software company. We help businesses reply faster, follow up properly and stop doing by hand what a system can do better." />
      <Split num="01" title="Our goal" className="border-t border-line">
        <p className="h3 reveal">To give every growing business the kind of connected, automated operations that used to need a large team and an IT department.</p>
      </Split>
      <Split num="02" title="How we think" className="border-t border-line">
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map(([t, d], i) => (
            <div key={t} className="card reveal p-6 md:p-8" style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
              <p className="h4">{t}</p>
              <p className="mt-3 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Split>
      <Split num="03" title="The team" className="border-t border-line">
        <div className="grid gap-4 md:grid-cols-3">
          {team.map((m, i) => (
            <div key={m.name} className="reveal" style={{ ["--d" as string]: `${i * 0.08}s` }}>
              <div className="card grid aspect-[4/5] place-items-center text-6xl font-semibold text-muted/40">{m.name[0]}</div>
              <p className="h4 mt-5">{m.name}</p>
              <p className="text-sm text-accent-strong">{m.role}</p>
              <p className="mt-3 text-[.95rem] text-muted">{m.bio}</p>
            </div>
          ))}
        </div>
        <div className="reveal mt-14"><Btn href="/contact">Work with us</Btn></div>
      </Split>
    </>
  );
}
