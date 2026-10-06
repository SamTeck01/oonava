# Oonava website

Agency site for Oonava: **Automate. Integrate. Build.** Built with Next.js 15 (App Router), TypeScript and Tailwind CSS v4.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | Where |
|---|---|
| All copy: services, pricing, FAQs, demos, steps | `src/lib/content.ts` |
| Colours, type scale, motion tokens | `src/app/globals.css` (`:root` + dark theme) |
| Pages | `src/app/**/page.tsx` |
| Shared UI (Header, Footer, Pipeline, Calculator, Estimate, FAQ) | `src/components/` |
| Contact form endpoint | `src/app/api/contact/route.ts` |

Adding a service = adding an entry to `services` in `content.ts`; its page at `/services/<slug>` is generated automatically.

## Pages

`/` · `/services` · `/services/{automate,connect,build,support}` · `/solutions/real-estate` · `/work` · `/work/{capture,follow-up,operate}` · `/pricing` · `/how-we-work` · `/about` · `/estimate` · `/contact` · `/privacy` · `/terms`

## Still to do before launch

- **Calendly**: set `site.calendlyUrl` in `src/lib/content.ts`. The contact page switches from the form to the Calendly embed automatically.
- **Contact email**: set `RESEND_API_KEY` and `CONTACT_TO` (see `.env.example`). Until then, form submissions are only logged by the server.
- **Company email**: replace `hello@oonava.com` in `site.email` if different.
- Team photos and final bios (`src/app/about/page.tsx`), logo, privacy policy review.
- Swap concept demos for the real interactive demos once built.

## Performance rules

Animate only `transform` and `opacity`. Heroes animate with CSS (no JS wait). Scroll reveals use one shared IntersectionObserver. Lenis smooth scroll loads only on mouse/trackpad devices. `prefers-reduced-motion` is respected. Lighthouse (mobile): Performance 97–99, Accessibility/Best practices/SEO 100.
