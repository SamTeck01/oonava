import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy policy" };

// TODO: have this reviewed before launch; add company registration details once incorporated.
export default function Privacy() {
  return (
    <article className="container-x max-w-3xl pt-36 pb-24 md:pt-48 [&_h2]:h4 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted [&_p]:mb-4">
      <h1 className="h2 mb-10">Privacy policy</h1>
      <p>This policy explains how Oonava collects and uses personal data when you use this website or contact us.</p>
      <h2>What we collect</h2>
      <p>When you fill in a form, we collect the details you provide: your name, email, company, phone number and message. We do not use advertising cookies on this site without your consent.</p>
      <h2>How we use it</h2>
      <p>We use your details only to reply to your enquiry and arrange a consultation. Our lawful basis is legitimate interest in responding to your request.</p>
      <h2>How long we keep it</h2>
      <p>We keep enquiry data for up to 24 months unless you become a client, after which our contract terms apply.</p>
      <h2>Your rights</h2>
      <p>Under UK GDPR you can ask to access, correct or delete your data, or object to how we use it. Email {site.email} and we&apos;ll respond within one month. You can also complain to the Information Commissioner&apos;s Office (ico.org.uk).</p>
      <h2>Contact</h2>
      <p>{site.email}</p>
    </article>
  );
}
