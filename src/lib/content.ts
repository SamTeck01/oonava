// All site copy lives here so pages stay presentational.

export const site = {
  name: "Oonava",
  email: "hello@oonava.com", // TODO: replace when the company inbox is live
  calendlyUrl: "", // TODO: set once Calendly is connected; contact page falls back to the form
  tagline: "Automate. Integrate. Build.",
};

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  num: string;
  title: string;
  short: string;
  pitch: string;
  intro: string;
  items: { title: string; text: string }[];
  examples: string[];
  outcomes: string[];
  tools: string[];
  faqs: Faq[];
};

export const services: Service[] = [
  {
    slug: "automate",
    num: "01",
    title: "Automate",
    short: "AI & workflow automation",
    pitch: "Turn repetitive processes into systems that run themselves.",
    intro:
      "Every business has work that follows the same steps every time: approvals, data entry, hand-offs, reminders and reports. We map that work and hand it to a system that does it in seconds, every time, at any hour.",
    items: [
      { title: "Workflow automation", text: "Repetitive, rule-based work mapped and automated end to end with n8n, Make or custom code: approvals, hand-offs, notifications and data entry." },
      { title: "AI document processing", text: "Contracts, forms, invoices and IDs read automatically. Data extracted, validated and filed where it belongs." },
      { title: "AI assistants & agents", text: "Assistants trained on your own knowledge that answer questions, draft replies and take actions inside your tools." },
      { title: "Inbox & communication automation", text: "Emails, WhatsApp and web enquiries classified, answered and routed to the right person, at any hour." },
    ],
    examples: ["Customer enquiries answered and routed by AI", "Signed form → contract → onboarding sequence", "Invoices read and pushed to accounting", "Weekly reports generated and sent automatically"],
    outcomes: ["Hours of manual work removed every week", "Faster responses to customers", "Fewer errors from copy and paste", "A clear human hand-off where judgement matters"],
    tools: ["OpenAI", "Gemini", "n8n", "Make", "Zapier", "Email & WhatsApp"],
    faqs: [
      { q: "Will the AI say something wrong to my customers?", a: "The AI works inside rules you approve. It answers from your information only, and anything it isn't sure about is passed to a person instead of guessed." },
      { q: "Can a person take over a conversation?", a: "Yes. Your team can step in at any point, and the automation pauses for that lead so nobody receives two replies." },
    ],
  },
  {
    slug: "connect",
    num: "02",
    title: "Connect",
    short: "Integrations & APIs",
    pitch: "Make your CRM, email, calendar and business tools work as one system.",
    intro:
      "Most businesses already have good tools. The problem is that they don't talk to each other, so people do the talking for them: copying, pasting and re-typing. We connect what you already use, including systems without a ready-made integration.",
    items: [
      { title: "CRM integration", text: "HubSpot, Pipedrive, Salesforce, Zoho or your property CRM kept up to date automatically from every channel." },
      { title: "Custom API connections", text: "When there's no Zapier or Make integration, we build one directly against the API: webhooks, authentication and data mapping." },
      { title: "Calendar & booking", text: "Viewings and meetings booked straight into the right person's calendar, with confirmations and reminders." },
      { title: "Data sync & reporting", text: "One reliable source of truth, with dashboards that show your pipeline without anyone building a spreadsheet." },
    ],
    examples: ["Website + portals → one CRM", "CRM stage change → email + task", "Bookings → calendar + reminders", "All sources → one pipeline dashboard"],
    outcomes: ["Keep the tools that already work", "No more copy and paste between systems", "Data you can trust", "One view of the whole pipeline"],
    tools: ["HubSpot", "Pipedrive", "Salesforce", "Google Workspace", "Microsoft 365", "Airtable", "REST & webhooks"],
    faqs: [
      { q: "Do we need to replace our CRM?", a: "No. We work with the tools you already have. We only recommend a change if a tool is genuinely blocking you, and we'll explain why." },
      { q: "What if our software has no integration?", a: "If it has an API, we can connect it. If it doesn't, we look at exports, email parsing or other reliable routes, and tell you honestly what's possible." },
    ],
  },
  {
    slug: "build",
    num: "03",
    title: "Build",
    short: "Custom software",
    pitch: "When existing software isn't enough, we build what your business actually needs.",
    intro:
      "No-code tools go a long way, until they don't. When a process outgrows them, we build the missing piece properly: a backend, a portal, a dashboard or an AI system designed around how your business really works.",
    items: [
      { title: "Dashboards & internal tools", text: "Purpose-built screens for your team, showing what matters and letting them act on it." },
      { title: "Client & agent portals", text: "Secure portals where clients, landlords or agents can see progress, upload documents and book time." },
      { title: "Custom backends & APIs", text: "Node.js and TypeScript services with proper databases, for logic too complex for no-code tools." },
      { title: "AI systems", text: "Knowledge bases, retrieval (RAG), structured outputs and multi-step AI workflows built on your own data." },
    ],
    examples: ["Lead & viewing dashboard", "Landlord / tenant portal", "AI knowledge base for staff", "Custom booking engine"],
    outcomes: ["Software that fits your process", "Systems that grow without getting messy", "Your data in one structured place", "No lock-in to a tool's limits"],
    tools: ["TypeScript", "Node.js", "Next.js", "PostgreSQL", "Supabase", "MongoDB", "Vector databases"],
    faqs: [
      { q: "Who owns what you build?", a: "You do. The code, the data and the accounts belong to your business, and everything is documented." },
      { q: "When should we build custom instead of using no-code?", a: "When the process is core to your business, has complex rules or is growing fast. We'll tell you plainly if no-code is enough." },
    ],
  },
  {
    slug: "support",
    num: "04",
    title: "Support",
    short: "Monitoring & maintenance",
    pitch: "We don't build it and disappear. We keep it running.",
    intro:
      "Automations break quietly: an API changes, a token expires, a form gets a new field. Every Oonava system ships with error handling, logs and alerts, and our monthly plans mean someone is watching it for you.",
    items: [
      { title: "Monitoring & alerts", text: "Failures are caught and reported to us, usually before you notice anything." },
      { title: "Error handling & retries", text: "Failed steps retry safely, duplicates are prevented and nothing is processed twice." },
      { title: "Updates & improvements", text: "Small changes and improvements each month as your business and tools evolve." },
      { title: "Documentation & handover", text: "Clear documentation of every workflow, so your team always knows what runs and why." },
    ],
    examples: ["Daily health checks", "Failed-run alerts", "Monthly change requests", "Quarterly review"],
    outcomes: ["Fewer surprises", "Fast fixes when tools change", "Systems that improve over time", "Peace of mind"],
    tools: ["Logging", "Alerts", "Backups", "Uptime checks"],
    faqs: [
      { q: "What happens if something breaks?", a: "On a support plan we're alerted automatically and fix it. Without one, we can still help at our standard rate." },
    ],
  },
];

export const pillars = services.slice(0, 3);

export const tiers = [
  {
    name: "Essential Automation",
    level: "Basic",
    setup: "£1,500",
    monthly: "£199",
    from: false,
    lead: "Remove one repetitive bottleneck.",
    for: "For businesses with one painful process.",
    features: ["One core workflow, end to end", "Connected to your existing tools", "Error handling & alerts", "Documentation & handover", "Monthly monitoring & small changes"],
    examples: "Lead routing · Email automation · CRM updates · Appointment booking · Document processing",
  },
  {
    name: "Connected Automation + AI",
    level: "Standard",
    setup: "£4,500",
    monthly: "£499",
    from: false,
    featured: true,
    lead: "Connect the workflow from end to end.",
    for: "Our most popular package for growing teams.",
    features: ["Several connected workflows", "AI reading, qualification & replies", "Follow-up sequences", "Booking & human hand-off", "Pipeline dashboard", "Priority monitoring & improvements"],
    examples: "Enquiry → AI → CRM → follow-up → booking → agent",
  },
  {
    name: "Custom Systems",
    level: "Premium",
    setup: "£10,000",
    monthly: "£999",
    from: true,
    lead: "Build the system your business actually needs.",
    for: "When off-the-shelf tools aren't enough.",
    features: ["Custom dashboards & portals", "Custom APIs & integrations", "AI agents & knowledge systems", "Database & system architecture", "Dedicated support & roadmap"],
    examples: "Internal tools · Client portals · AI agents · Bespoke software",
  },
];

export const steps = [
  { num: "01", title: "Discover", text: "A free call to understand your business and find the bottleneck costing you the most.", result: "A clear list of what's worth automating, and what isn't." },
  { num: "02", title: "Map", text: "We map the workflow step by step and decide what happens automatically and where a person steps in.", result: "A workflow map and a fixed price before any build starts." },
  { num: "03", title: "Build", text: "We automate, integrate or develop the missing pieces inside your existing tools.", result: "A working system, tested on real scenarios." },
  { num: "04", title: "Launch", text: "We go live with your team, train them and watch the first real runs closely.", result: "Your team confident with the new workflow." },
  { num: "05", title: "Improve", text: "We monitor, maintain and keep improving it as your business changes.", result: "A system that keeps working, and gets better." },
];

export const demos = [
  {
    slug: "capture",
    num: "01",
    title: "Capture",
    name: "Lead Conversion System",
    line: "Turn enquiries into qualified opportunities.",
    problem: "We spend money generating leads, then take hours to respond to them.",
    steps: ["Enquiry received", "AI understands it", "Lead scored: HOT", "CRM updated", "Personalised reply sent", "Viewing offered", "Calendar booked", "Agent notified"],
    sector: "Real estate",
    tags: ["AI", "Integrations", "CRM"],
    challenge: "Enquiries arrive from portals, the website and email at all hours. Each one is read, typed into the CRM and answered by hand, often hours later.",
    solution: "An AI pipeline that reads every enquiry, extracts requirements, scores intent, updates the CRM, sends a personalised reply and offers real viewing slots.",
    stack: ["Gemini / OpenAI", "Webhooks", "Airtable / CRM API", "Google Calendar", "Email & WhatsApp"],
  },
  {
    slug: "follow-up",
    num: "02",
    title: "Follow Up",
    name: "Follow-Up Engine",
    line: "Keep leads moving without adding another employee.",
    problem: "Leads say “I'll think about it” and nobody follows up properly.",
    steps: ["Reply detected: not ready", "Status: nurturing", "Day 2: useful follow-up", "Day 5: new listings", "Day 10: check-in", "Lead replies", "Upgraded WARM → HOT", "Agent notified"],
    sector: "Sales operations",
    tags: ["AI", "Automation", "Dashboard"],
    challenge: "Most prospects aren't ready on day one. Without a system, follow-up depends on someone remembering, and warm leads go cold.",
    solution: "A follow-up engine that reads conversation state, runs timed sequences, stops the moment a person replies and alerts the team when someone is ready.",
    stack: ["AI classification", "n8n", "CRM API", "Email sequences", "Pipeline dashboard"],
  },
  {
    slug: "operate",
    num: "03",
    title: "Operate",
    name: "Operations System",
    line: "Connect the work happening behind the scenes.",
    problem: "Every booking creates ten small admin tasks for your team.",
    steps: ["Viewing booked", "CRM opportunity updated", "Calendar event created", "Confirmation emailed", "Reminder via WhatsApp", "Agent briefing sent", "Outcome recorded", "Next workflow triggered"],
    sector: "Operations",
    tags: ["Integrations", "Custom backend", "Database"],
    challenge: "Every booking triggers a chain of admin across five systems: CRM, calendar, email, messaging and spreadsheets.",
    solution: "One event-driven backend that connects every system, so a single booking updates everything, briefs the team and triggers the next step.",
    stack: ["Node.js / TypeScript", "PostgreSQL", "Webhooks & queues", "Calendar & CRM APIs", "WhatsApp Business API"],
  },
];

export const industries = [
  { title: "Real Estate", text: "Enquiry handling, viewings, CRM and landlord operations.", href: "/solutions/real-estate", live: true },
  { title: "Professional Services", text: "Client intake, documents, scheduling and billing workflows.", href: "/contact", live: false },
  { title: "E-commerce & Retail", text: "Orders, customer service, inventory and supplier data.", href: "/contact", live: false },
  { title: "Growing Businesses", text: "Internal tools and connected systems that replace spreadsheets.", href: "/contact", live: false },
];

export const tech = [
  { group: "AI", items: ["OpenAI", "Gemini", "Claude", "RAG", "Vector databases", "AI agents"] },
  { group: "Automation", items: ["n8n", "Make", "Zapier", "Webhooks"] },
  { group: "Development", items: ["TypeScript", "Node.js", "Next.js", "React", "PostgreSQL", "Supabase", "MongoDB"] },
  { group: "Integrations", items: ["HubSpot", "Pipedrive", "Salesforce", "Airtable", "Google Workspace", "Microsoft 365", "WhatsApp API", "Stripe"] },
];

export const toolNames = ["HubSpot", "Pipedrive", "Salesforce", "Zoho", "Google Workspace", "Microsoft 365", "Outlook", "Gmail", "WhatsApp", "Calendly", "Airtable", "Notion", "Rightmove", "Zoopla", "Slack", "Stripe"];

export const trust = [
  { title: "Privacy by design", text: "We collect and keep only the data a workflow needs, and agree retention with you." },
  { title: "Least-privilege access", text: "Each system gets the minimum permissions required, using your accounts, not ours." },
  { title: "Human oversight", text: "AI works within approved rules, and uncertain cases go to a person." },
  { title: "Logged & documented", text: "Every automated action is logged and every workflow documented." },
];

export const faqs: Faq[] = [
  { q: "Will Oonava replace our CRM?", a: "No. We connect the tools you already use. We only recommend a change if a tool is genuinely holding you back." },
  { q: "Can you work with our existing software?", a: "Almost always. If it has an API we can connect it, and if there's no ready-made integration we build one." },
  { q: "What happens if the AI makes a mistake?", a: "The AI works inside rules you approve and only uses your information. Anything uncertain is handed to a person, and every action is logged so it can be reviewed." },
  { q: "Can a human take over?", a: "Yes, at any time. When your team steps into a conversation, the automation pauses for that contact." },
  { q: "How do you handle our customer data?", a: "We follow UK GDPR principles: data minimisation, least-privilege access, your accounts, agreed retention and full documentation. We're happy to sign an NDA and a data processing agreement." },
  { q: "How long does implementation take?", a: "Essential Automation is usually live in 1–2 weeks. Connected Automation + AI takes 3–6 weeks. Custom Systems are scoped and timed per project." },
  { q: "How much does it cost?", a: "Essential Automation is £1,500 setup + £199/month. Connected Automation + AI is £4,500 + £499/month. Custom Systems start from £10,000 + £999/month. You get a fixed price after the mapping call." },
  { q: "What happens after launch?", a: "Your monthly plan covers monitoring, alerts, fixes and small improvements, so the system keeps working as your tools change." },
  { q: "Can you build something custom?", a: "Yes. That's what our Build service is for: dashboards, portals, APIs and AI systems for when existing tools aren't enough." },
];

export const realEstate = {
  stats: [
    { value: "< 60s", label: "target reply time, day and night" },
    { value: "24/7", label: "every enquiry answered, including weekends" },
    { value: "0", label: "leads forgotten in an inbox" },
  ],
  pains: [
    { title: "Slow replies", text: "An enquiry lands at 9pm. Someone answers at 11am. The buyer has already booked with another agent." },
    { title: "No follow-up", text: "Leads who don't book on day one get forgotten, even though many buy weeks later." },
    { title: "Manual admin", text: "Copying portal enquiries into the CRM, chasing calendars, sending the same emails by hand." },
    { title: "Scattered data", text: "Leads in inboxes, portals and spreadsheets. Nobody sees the whole pipeline." },
  ],
  faqs: [
    { q: "Does it work with Rightmove, Zoopla and our own website?", a: "Yes. Enquiries from portals, your website, email and social can all flow into the same system." },
    { q: "Will it work with our property CRM?", a: "In most cases, yes. We connect through its API or another reliable route, and we'll confirm on the discovery call." },
    { q: "Can it book viewings into our agents' calendars?", a: "Yes. Leads are offered real available slots, and bookings land in the right agent's calendar with confirmations and reminders." },
  ] as Faq[],
};
