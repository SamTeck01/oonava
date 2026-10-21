import type { Row } from "./db";
import { hashPassword } from "./team";

// Sample team data used until Supabase is connected. Passwords are only for this demo.
export function seed(): Record<string, Row[]> {
  const day = 86_400_000, now = Date.now();
  const iso = (d: number) => new Date(now + d * day).toISOString();
  const date = (d: number) => iso(d).slice(0, 10);
  const pw = hashPassword("demo12345");
  const u = (id: string, name: string, email: string, title: string, permissions: string[], status = "active") => ({ id, name, email, personal_email: "", title, permissions, password_hash: pw, status, created_at: iso(-30), last_login: null });
  return {
    team_users: [
      u("u_kelly", "Kelly", "kelly@oonava.com", "Founder", ["admin"]),
      u("u_samad", "Abdul Samad Oyewole", "samad@oonava.com", "Software & AI", ["admin"]),
      u("u_delight", "Delight", "delight@oonava.com", "Automation & CRM", ["admin"]),
      u("u_fel", "Fel", "fel@oonava.com", "Outreach", ["outreach"]),
      { ...u("u_new", "Tunde Ade", "tunde@oonava.com", "", [], "pending"), created_at: iso(-0.05) },
    ],
    projects: [
      { id: "p_khan", created_at: iso(-18), name: "Lead engine", client: "Khan Realty", lead_id: "demo_7", package: "Connected Automation + AI", stage: "Building", owner_id: "u_delight", due_date: date(9), setup_fee: 4500, monthly_fee: 499, links: "Airtable: https://airtable.com\nMake: https://make.com", notes: "WhatsApp + email replies, Rightmove/Zoopla parsing." },
      { id: "p_reed", created_at: iso(-28), name: "Order & stock sync", client: "Reed Outdoors", lead_id: "demo_8", package: "Essential Automation", stage: "Live", owner_id: "u_samad", due_date: null, setup_fee: 1500, monthly_fee: 199, links: "", notes: "Shopify → email + stock sheet." },
    ],
    tasks: [
      { id: "t1", created_at: iso(-2), title: "Connect Rightmove enquiry parser", details: "", assignee_id: "u_delight", due_date: date(1), done: false, project_id: "p_khan", lead_id: null, created_by: "u_kelly" },
      { id: "t2", created_at: iso(-2), title: "Build viewing booking webhook", details: "", assignee_id: "u_samad", due_date: date(3), done: false, project_id: "p_khan", lead_id: null, created_by: "u_kelly" },
      { id: "t3", created_at: iso(-1), title: "Call 15 Manchester agencies from Spark list", details: "Use the 'Speed to lead' script.", assignee_id: "u_fel", due_date: date(0), done: false, project_id: null, lead_id: null, created_by: "u_kelly" },
      { id: "t4", created_at: iso(-3), title: "Send Brooks Property proposal follow-up", details: "", assignee_id: "u_kelly", due_date: date(-1), done: false, project_id: null, lead_id: "demo_4", created_by: "u_kelly" },
      { id: "t5", created_at: iso(-6), title: "Monthly health check: Reed Outdoors", details: "", assignee_id: "u_samad", due_date: date(-2), done: true, project_id: "p_reed", lead_id: null, created_by: "u_kelly" },
      ...["Kick-off call and access to client tools", "Map the workflow and agree what runs automatically"].map((t, i) => ({ id: `ck${i}`, created_at: iso(-18), title: t, details: "", assignee_id: "u_delight", due_date: null, done: true, project_id: "p_khan", lead_id: null, created_by: "u_kelly" })),
    ],
    invoices: [
      { id: "i1", created_at: iso(-18), number: "OON-2026-001", client: "Khan Realty", project_id: "p_khan", kind: "Setup", amount: 4500, currency: "EUR", due_date: date(-4), status: "Paid", paid_at: iso(-5), notes: "" },
      { id: "i2", created_at: iso(-3), number: "OON-2026-002", client: "Khan Realty", project_id: "p_khan", kind: "Monthly", amount: 499, currency: "EUR", due_date: date(7), status: "Sent", paid_at: null, notes: "" },
      { id: "i3", created_at: iso(-35), number: "OON-2026-003", client: "Reed Outdoors", project_id: "p_reed", kind: "Monthly", amount: 199, currency: "EUR", due_date: date(-3), status: "Overdue", paid_at: null, notes: "" },
    ],
    activity: [
      { id: "a1", created_at: iso(-0.1), user_id: "u_fel", user_name: "Fel", action: "logged a call with", target: "Martin Immobilier", link: "/admin/leads/demo_6" },
      { id: "a2", created_at: iso(-0.4), user_id: "u_delight", user_name: "Delight", action: "completed", target: "Map the workflow (Khan Realty)", link: "/admin/projects/p_khan" },
      { id: "a3", created_at: iso(-1), user_id: "u_kelly", user_name: "Kelly", action: "sent a proposal to", target: "Brooks Property Group", link: "/admin/leads/demo_4" },
    ],
  };
}
