import "server-only";
import { makeTable, type Row } from "./db";
import { seed } from "./seed";

export const PROJECT_STAGES = ["Onboarding", "Building", "Testing", "Live", "Support", "Paused"] as const;
export type Project = Row & {
  name: string; client: string; lead_id: string | null; package: string; stage: (typeof PROJECT_STAGES)[number];
  owner_id: string | null; due_date: string | null; setup_fee: number; monthly_fee: number; links: string; notes: string;
};

export type Task = Row & {
  title: string; details: string; assignee_id: string | null; due_date: string | null; done: boolean;
  project_id: string | null; lead_id: string | null; created_by: string | null;
};

export const INVOICE_STATUS = ["Draft", "Sent", "Paid", "Overdue", "Cancelled"] as const;
export type Invoice = Row & {
  number: string; client: string; project_id: string | null; kind: "Setup" | "Monthly" | "Extra"; amount: number;
  currency: "EUR" | "GBP"; due_date: string | null; status: (typeof INVOICE_STATUS)[number]; paid_at: string | null; notes: string;
};

export type Activity = Row & { user_id: string | null; user_name: string; action: string; target: string; link: string };

export const projects = makeTable<Project>("projects", seed);
export const tasks = makeTable<Task>("tasks", seed);
export const invoices = makeTable<Invoice>("invoices", seed);
export const activity = makeTable<Activity>("activity", seed);

export const DEFAULT_CHECKLIST = [
  "Kick-off call and access to client tools",
  "Map the workflow and agree what runs automatically",
  "Build the automations / integrations",
  "Test with real scenarios",
  "Train the client team",
  "Go live and monitor the first week",
  "Hand over documentation",
];
