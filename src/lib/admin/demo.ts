import type { Lead } from "./store";

// Fictional sample leads shown only while Airtable isn't connected.
export function demoLeads(): Lead[] {
  const day = 86_400_000;
  const ago = (d: number) => new Date(Date.now() - d * day).toISOString();
  const ahead = (d: number) => new Date(Date.now() + d * day).toISOString().slice(0, 10);
  const base = { assignedTo: "", phone: "", replySent: "", followUps: 0, firstContacted: "", lastContacted: "", notes: "", activity: "", dealValue: 0, monthlyValue: 0, nextAction: "", scoreReason: "" };
  const rows: Partial<Lead>[] = [
    { name: "Sarah Mitchell", email: "sarah@example-homes.co.uk", company: "Mitchell Homes", phone: "+447700900123", message: "We get about 200 portal enquiries a month and reply by hand. Want to automate replies and CRM updates.", source: "Contact form", summary: "Estate agency, ~200 portal enquiries/month, manual replies; wants automated replies and CRM updates.", industry: "Real estate", tier: "Connected Automation + AI", score: "Hot", scoreReason: "Concrete process and volume, ready to act.", status: "Booked", created: ago(1), nextAction: ahead(1), assignedTo: "kelly@oonava.com" },
    { name: "James Okafor", email: "james@example-lettings.com", company: "Okafor Lettings", message: "Looking to automate tenant enquiries and viewing bookings.", source: "Estimate tool", summary: "Lettings agency wants tenant enquiry handling and viewing booking.", industry: "Real estate", tier: "Connected Automation + AI", score: "Hot", scoreReason: "Clear use case from the estimate tool.", status: "New", created: ago(0.2) },
    { name: "Priya Shah", email: "priya@example-legal.co.uk", company: "Shah & Co Solicitors", message: "Client intake forms take hours each week.", source: "Contact form", summary: "Law firm, manual client intake; wants form and document automation.", industry: "Professional services", tier: "Essential Automation", score: "Warm", status: "Contacted", followUps: 1, created: ago(3), firstContacted: ago(3) },
    { name: "Daniel Brooks", email: "dan@example-property.com", company: "Brooks Property Group", message: "Need a landlord portal and dashboards across 3 offices.", source: "Contact form", summary: "Property group with 3 offices wants landlord portal and reporting dashboards.", industry: "Real estate", tier: "Custom Systems", score: "Hot", status: "Proposal", dealValue: 12000, monthlyValue: 999, created: ago(6), nextAction: ahead(2) },
    { name: "Emma Clarke", email: "emma@example-clinic.co.uk", company: "Clarke Physio", message: "Appointment reminders and follow-ups.", source: "Estimate tool", summary: "Clinic wants appointment reminders and patient follow-ups.", industry: "Healthcare", tier: "Essential Automation", score: "Warm", status: "Replied", created: ago(4) },
    { name: "Leo Martin", email: "leo@example-estates.fr", company: "Martin Immobilier", message: "Interested but not ready yet.", source: "Manual", summary: "French agency, interested, timing unclear.", industry: "Real estate", tier: "Connected Automation + AI", score: "Warm", status: "Contacted", followUps: 2, created: ago(9), firstContacted: ago(9), assignedTo: "fel@oonava.com", phone: "+33612345678" },
    { name: "Aisha Khan", email: "aisha@example-homes.ae", company: "Khan Realty", message: "Signed off. Let's start the lead automation.", source: "Contact form", summary: "Real estate agency, signed for lead engine.", industry: "Real estate", tier: "Connected Automation + AI", score: "Hot", status: "Won", dealValue: 4500, monthlyValue: 499, created: ago(20) },
    { name: "Tom Reed", email: "tom@example-ecom.com", company: "Reed Outdoors", message: "Order emails and stock syncing.", source: "Contact form", summary: "E-commerce store; order emails and stock sync between tools.", industry: "E-commerce", tier: "Essential Automation", score: "Warm", status: "Won", dealValue: 1500, monthlyValue: 199, created: ago(30) },
    { name: "Ben Ade", email: "ben@example.com", company: "", message: "Hi, are you hiring?", source: "Contact form", summary: "Job seeker, not a prospect.", industry: "Unknown", tier: "Unclear", score: "Cold", status: "Lost", created: ago(12) },
  ];
  return rows.map((r, i) => ({ ...base, ...r, id: `demo_${i + 1}`, activity: r.activity ?? `${(r.created ?? "").slice(0, 16).replace("T", " ")} · Lead created (${r.source})` }) as Lead);
}

// Sourced, not-yet-contacted prospects for the outreach desk demo.
export function demoProspects(): Partial<Lead>[] {
  const cities = ["Manchester", "Leeds", "Birmingham", "Bristol", "Dublin", "Lisbon"];
  return cities.map((c, i) => ({ name: `${["Harbour", "Oak", "Northgate", "Riverside", "Liffey", "Tejo"][i]} Estates`, email: `info@example-${c.toLowerCase()}-estates.com`, company: `${["Harbour", "Oak", "Northgate", "Riverside", "Liffey", "Tejo"][i]} Estates`, phone: `+44 7700 9000${10 + i}`, industry: "Real estate", source: "Gemini Spark", status: "New" as const, notes: `Location: ${c}`, summary: `Estate agency in ${c}, sourced by Gemini Spark.`, assignedTo: i < 4 ? "fel@oonava.com" : "" }));
}
