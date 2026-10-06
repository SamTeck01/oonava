# Oonava website: spec (draft for sign-off)

Market: UK (£, UK GDPR wording). Scope: agency website only. Demos come later; until then the Work section shows **concept** demos, clearly labelled.

## 1. What the Ronas IT analysis showed

Reviewed from 73 downloaded pages (reference only, not in git).

**Architecture.** The homepage is a hub, not the whole sales pitch. It names three pillars (Design. Development. Maintenance.) and links out to depth: around 30 service pages, cases, pricing, how we work, technologies, expertise/industries, about, blog and contact.

**Homepage order:**
1. H1 of three words. Their words can't be copied, but the rhythm can.
2. "What we do" as 3 outcome statements (MVP, automate internal processes, apps for customers).
3. The pillars as numbered blocks (`01 Design`, `02 Development`, `03 Maintenance`), each with 2–4 sub-services.
4. Cases (4 featured).
5. Compliance/security block.
6. Testimonials.
7. FAQ, which includes pricing and timelines.
8. Contact CTA.

**Service page template (repeated around 30 times):** H1 → what it is → how it works → types → integrations → tools/models → features → process → industries → why us → articles → testimonials → FAQ (cost, time, risk). It's a sales page and an SEO page at the same time.

**Pricing page:** a full catalogue grouped by category, with "from" figures and a CTA for a personal estimate.

**How we work:** for each phase, the steps followed by "As a result, the client gets…". Every phase shows the deliverable.

**Design system:**
- Colour: near-black `#03030f` on white, greys `#f3f3f3`, `#93989c` and `#dbdbdb`, and one blue accent `#26a0f8`, used sparingly.
- Type: one family, Zona Pro, which is paid; we won't use it. The scale is modest: H1 is 3.75rem (60px) and only 2.85rem on mobile. Body text is 16–18px. The "huge" feel comes from whitespace, not giant font sizes.
- Layout: 1320px container. Breakpoints at 1023px and 767px, with around 340 mobile rules, so it's heavily mobile-tuned.
- Radius: 24–30px on cards and images, 50% on circles.
- Motion: CSS transitions of 0.5s on transform and opacity, easing `cubic-bezier(.37,0,.63,1)`. GSAP is loaded in one place only. No WebGL and no heavy libraries. **That's why it doesn't lag.**

**Takeaway for Oonava:** copy the *system*, not the visuals. One accent colour, a disciplined type scale, numbered pillars, a repeatable service-page template, a pricing catalogue, phases with deliverables, and motion that's 90% CSS with GSAP only for the signature moments.

## 2. Oonava sitemap (launch)

```
/                         Home
/services                 Overview of the 3 pillars
  /services/automate      AI & workflow automation
  /services/connect       Integrations & APIs
  /services/build         Custom software
  /services/support       Monitoring & maintenance
/solutions/real-estate    Industry page (main ad destination)
/work                     Concept demos (labelled), real cases later
/pricing                  3 tiers + "from" figures
/how-we-work              Discover → Map → Build → Launch → Improve
/about                    Kelly, Delight, Samad
/estimate                 "Estimate your automation" assessment (main CTA)
/contact                  Book a consultation
/privacy, /terms
```
Blog: later. Don't launch it empty.

## 3. Homepage

| # | Section | Content |
|---|---------|---------|
| Hero | **Automate. Integrate. Build.** | Sub-line: "Turn more enquiries into appointments without adding another person to your team." CTAs: *Estimate your automation* · *Book a consultation*. A living SVG of a lead moving: Enquiry → AI → Qualify → CRM → Follow-up → Booking → Human |
| 01 | Problem | "You're paying for the lead. Why are you still paying someone to move it between systems?" The manual chain fades out and the Oonava chain draws in |
| 02 | Pillars | `01 Automate` `02 Connect` `03 Build`, each with sub-items and a link to its service page |
| 03 | Concept demos | Capture / Follow Up / Operate, each a scripted, animated preview labelled **Concept** |
| 04 | Industries | Real Estate (live) · Professional Services · Growing Businesses |
| 05 | Keep your tools | Logos as text chips (HubSpot, Pipedrive, Google, Microsoft…) → Oonava → workflow. "Keep the tools that work. We'll connect the gaps." |
| 06 | Cost of doing nothing | A calculator in hours and £, labelled an *illustrative estimate* |
| 07 | How we work | 5 phases, each with a deliverable |
| 08 | Pricing teaser | 3 tiers with "from £X" → /pricing |
| 09 | Trust & data | UK GDPR principles, permissions, human oversight, logging. **No certification badges** |
| 10 | FAQ | Replace our CRM? Existing software? AI mistakes? Human takeover? Data? Timeline? After launch? Custom builds? |
| CTA | Final call to action | "Find the bottleneck costing your business time." → /estimate |

No testimonials or case numbers until they're real.

## 4. Visual and motion rules
- Tokens: white or near-black background, one accent colour (TBD with Kelly's brand), greys. Light and dark mode.
- Font: free Google font (Manrope or Plus Jakarta Sans) via `next/font`.
- Type scale: Ronas-like but with `clamp()`. H1 is about 44px on mobile and 72px on desktop.
- Motion: CSS transitions of 0.5s on transform and opacity for most things. GSAP + ScrollTrigger only for the hero flow, the problem→solution swap and the sticky section titles. Lenis on desktop only. `prefers-reduced-motion` respected.
- Mobile-first: 375 / 768 / 1280. Targets: Lighthouse mobile 90+ for performance, 95+ for accessibility, CLS < 0.1.

## 5. Stack
Next.js (App Router) + TypeScript + Tailwind v4, deployed on Vercel. Content for services and pricing lives in typed data files, so a new service page means new data, not new code.

## 6. Open items
- **Tier prices:** not present in anything pasted so far. Needed for /pricing.
- Logo, brand colour, team photos and bios (Kelly).
- Domain and booking tool (Calendly or Cal.com?).
