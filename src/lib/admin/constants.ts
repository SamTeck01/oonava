// Shared constants safe to import from client components.
export const OUTCOMES = ["No answer", "Left voicemail", "Call back", "Interested", "Booked a call", "Not interested", "Wrong contact"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const PERMISSION_LIST = [
  { id: "admin", label: "Admin", hint: "Everything, including managing the team" },
  { id: "sales", label: "Sales", hint: "Leads, pipeline, proposals, mark as won" },
  { id: "outreach", label: "Outreach", hint: "Outreach desk: calls, emails, outcomes" },
  { id: "delivery", label: "Delivery", hint: "Client projects, checklists, tool links" },
  { id: "finance", label: "Finance", hint: "Invoices, payments, revenue numbers" },
  { id: "marketing", label: "Marketing", hint: "Lead imports, sources and lead stats" },
] as const;

export const SCRIPTS = [
  {
    title: "Speed to lead (cold call)",
    body: `Hi, is that [name]? It's [your name] from Oonava. I'll be quick.
We help estate agencies reply to every portal enquiry within seconds, day and night, and book viewings automatically.
Quick question: when an enquiry comes in at 9pm, how long does it usually take your team to reply?
[Listen]
That's really common. Would a free 30-minute call be useful, where we map how enquiries reach you and show you what could run on its own?`,
  },
  {
    title: "Gatekeeper",
    body: `Hi, I'm [your name] from Oonava. Who looks after how enquiries are handled, the branch manager or the owner?
Could I have their email so I can send a short note? It's about replying to portal enquiries faster.`,
  },
  {
    title: "Voicemail",
    body: `Hi [name], [your name] from Oonava. We help agencies reply to every enquiry in seconds and book more viewings automatically. I'll send you a short email. Speak soon.`,
  },
  {
    title: "Objection: we already have a CRM",
    body: `Perfect, we don't replace it. We connect to the tools you already use and remove the manual steps between them.`,
  },
  {
    title: "Objection: no budget",
    body: `Understood. Most agencies start with one workflow, from €1,500. One extra sale usually covers it. The mapping call is free either way.`,
  },
];
