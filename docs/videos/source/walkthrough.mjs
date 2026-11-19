import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
const B = "http://localhost:4800", OUT = process.argv[2];
const W = 1280, H = 720;
import fs from "fs";
const NARR = JSON.parse(fs.readFileSync(process.argv[3], "utf8")); const LOG = []; let T0 = 0;
const hold = (key, ms) => { const d = NARR[key]; if (d) { LOG.push({ t: Date.now() - T0, file: d.file }); return Math.max(d.dur * 1000 + 900, 2500); } return ms; };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
// log in first (not recorded)
const pre = await b.newContext({ viewport: { width: W, height: H } });
const lp = await pre.newPage();
await lp.goto(B + "/admin/login"); await lp.fill("[name=email]", "kelly@oonava.com"); await lp.fill("[name=password]", "demo12345"); await lp.press("[name=password]", "Enter"); await lp.waitForTimeout(2500);
const state = await pre.storageState(); await pre.close();

const ctx = await b.newContext({ viewport: { width: W, height: H }, storageState: state, recordVideo: { dir: OUT, size: { width: W, height: H } } });
const p = await ctx.newPage();
T0 = Date.now();
const wait = (ms) => p.waitForTimeout(ms);

const CSS = `
#ov-cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;width:min(1080px,92vw);background:rgba(3,3,15,.92);color:#fff;border-radius:18px;padding:18px 26px;font-family:Urbanist,system-ui,sans-serif;box-shadow:0 20px 60px -20px rgba(0,0,0,.5);animation:ovin .5s cubic-bezier(.16,1,.3,1)}
#ov-cap b{display:block;color:#26a0f8;font-size:15px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
#ov-cap span{font-size:24px;line-height:1.35;font-weight:600}
#ov-step{position:fixed;top:16px;right:20px;z-index:99999;background:#0b6fc0;color:#fff;font:700 13px system-ui;padding:6px 12px;border-radius:999px}
.ov-hl{outline:4px solid #26a0f8!important;outline-offset:4px!important;border-radius:14px;transition:outline .3s;box-shadow:0 0 0 9999px rgba(3,3,15,.18)!important;position:relative;z-index:9998}
@keyframes ovin{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}
[class*="bg-[#fff4d6]"],[class*="bg-amber"]{display:none!important}`;
let n = 0, total = 0;
async function cap(title, text, ms = 5200) {
  await p.addStyleTag({ content: CSS }).catch(() => {});
  await p.evaluate(([t, x, s]) => {
    document.getElementById("ov-cap")?.remove();
    const d = document.createElement("div"); d.id = "ov-cap"; d.innerHTML = `<b>${t}</b><span>${x}</span>`; document.body.appendChild(d);
    let st = document.getElementById("ov-step"); if (!st) { st = document.createElement("div"); st.id = "ov-step"; document.body.appendChild(st); }
    st.textContent = s;
  }, [title, text, `${n}/${total}`]);
  await wait(hold(text, ms));
}
async function hl(sel, i = 0) {
  await p.evaluate(() => document.querySelectorAll(".ov-hl").forEach((e) => e.classList.remove("ov-hl")));
  const el = p.locator(sel).nth(i);
  if (!(await el.count())) return;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await el.evaluate((e) => { e.scrollIntoView({ behavior: "smooth", block: "center" }); e.classList.add("ov-hl"); }).catch(() => {});
  await wait(700);
}
async function unhl() { await p.evaluate(() => document.querySelectorAll(".ov-hl").forEach((e) => e.classList.remove("ov-hl"))); }
async function go(path) { await p.goto(B + path); await wait(900); }
async function scrollBy(y) { await p.evaluate((y) => window.scrollBy({ top: y, behavior: "smooth" }), y); await wait(900); }
async function card(big, small, ms = 4500) {
  await p.setContent(`<html><body style="margin:0;height:100vh;display:grid;place-items:center;background:#03030f;color:#fff;font-family:Urbanist,system-ui,sans-serif"><div style="text-align:center;animation:a .9s cubic-bezier(.16,1,.3,1)"><p style="font-size:34px;font-weight:800;margin:0 0 26px">oonava<span style="color:#26a0f8">.</span></p><h1 style="font-size:64px;line-height:1.05;margin:0;letter-spacing:-.03em">${big}</h1><p style="font-size:26px;color:#9a9fa5;margin-top:22px">${small}</p></div><style>@keyframes a{from{opacity:0;transform:translateY(24px)}}</style></body></html>`);
  await wait(hold(small, ms));
}

const scenes = [
  async () => card("The Oonava team dashboard", "Everything you need to win and deliver clients, in one place.<br/>A 4-minute walkthrough.", 6000),
  async () => { await go("/admin/signup"); await cap("Getting in", "Request an account at oonava.com/admin/signup. Sign in with your work email, and add a personal email: that's where approvals, tasks and alerts are sent.", 6500); await go("/admin/login"); await cap("Getting in", "Once an admin approves you, sign in here. Forgot your password? Use the link under the form.", 4500); },
  async () => { await go("/admin"); await cap("Today", "Your home page. It shows what needs you right now, so start every day here.", 4500);
    await hl("section", 0).catch(()=>{}); await hl("a:has-text('New leads'), div:has-text('New leads (7 days)')", 0); await cap("Today: the numbers", "New leads this week, open pipeline value, monthly recurring revenue and hot leads still open.");
    await hl("section:has-text('My tasks')"); await cap("Today: my tasks", "Tasks assigned to you, with due dates. Tick a task to complete it.");
    await hl("section:has-text('Leads to act on')"); await cap("Today: leads to act on", "The system ranks who to contact next: hot new enquiries, replies, calls due, proposals to chase. Click the black button to jump straight in.", 6000);
    await hl("section:has-text('Team activity')"); await cap("Today: team activity", "Everything the team does is logged here, so everyone knows what's happening without asking."); await unhl(); },
  async () => { await go("/admin/outreach"); await cap("Outreach desk", "Your calling list. Prospects to contact or call back today, in order.", 4500);
    await hl("a:has-text('Call'), button:has-text('Call')"); await cap("Outreach: contact", "Call, WhatsApp or email in one click. Scripts for each situation are right on the page.");
    await hl("section:has-text('Log the outcome')"); await cap("Outreach: log the outcome", "After every call, log what happened and set a callback date. The next prospect loads automatically.", 6000); await unhl();
    await hl("button:has-text('Import prospects'), a:has-text('Import prospects')"); await cap("Outreach: import", "Got a list from Gemini Spark, LinkedIn or an event? Import it here as CSV or PDF."); await unhl(); },
  async () => { await go("/admin/leads"); await cap("Pipeline", "Every lead in one place: website enquiries, imports and leads added by hand.", 4500);
    await hl("input[placeholder*='Search']"); await cap("Pipeline: find anyone", "Search by name, company or email, and filter by stage and score.");
    await hl("button:has-text('Board'), a:has-text('Board')"); await p.locator("button:has-text('Board'), a:has-text('Board')").first().click().catch(()=>{}); await wait(1200); await unhl();
    await cap("Pipeline: board view", "Switch to Board to see deals moving from New to Won, stage by stage.", 5500); },
  async () => { await go("/admin/leads"); const l = p.locator("a:has-text('James Okafor')").first(); if (await l.count()) { await l.click(); await wait(1500); } else await go("/admin/leads/demo_p0");
    await cap("A lead", "Open any lead to see everything about it: the AI summary, score, contact details and full history.", 5000);
    await hl("select", 0); await cap("A lead: owner and stage", "Assign the lead to a teammate (they get notified) and update its stage as the deal moves.");
    await hl("section:has-text('Write an email with AI')"); await cap("A lead: write with AI", "Pick a purpose, such as follow-up or push to book a call, and AI drafts the email. Edit it, then send from hello@oonava.com, signed with your name.", 6500);
    await hl("section:has-text('Notes')"); await cap("A lead: notes", "Add notes after every conversation so the whole team has the context."); await unhl(); },
  async () => { await go(p.url().replace(B, "").split("?")[0] + "/proposal"); await cap("Proposals", "Turn a lead into a proposal in seconds. Pick the package, adjust the price and add notes from the call.", 5500);
    const w = p.locator("button:has-text('Write proposal')"); if (await w.count()) { await w.click(); await wait(3500); await p.evaluate(() => document.querySelectorAll("p").forEach((e) => { if (/AI isn.t available/.test(e.textContent || "")) e.remove(); })); }
    await cap("Proposals: edit and send", "AI writes the full proposal. Click any text to edit it, then Download PDF, or email it to the client with a personal note in one click.", 7000);
    await scrollBy(500); await hl("button:has-text('Send to client')"); await cap("Proposals: send to client", "Sending emails the proposal, moves the lead to the Proposal stage and logs it."); await unhl(); },
  async () => { await go("/admin/leads/new"); await cap("Add leads", "Add a lead you met by hand, or import a whole list.", 4500);
    await hl("section:has-text('Import a list')"); await cap("Add leads: import a list", "Upload a CSV, or a PDF that AI reads into rows you can check first. Assign the whole batch to a teammate.", 6000); await unhl(); },
  async () => { await go("/admin/projects"); await cap("Projects", "Won deals become projects automatically. Track every build from onboarding to live.", 5000);
    const pr = p.locator("a[href^='/admin/projects/']").first(); if (await pr.count()) { await pr.click(); await wait(1500); }
    await cap("A project", "Each project has a stage, an owner, a checklist, tasks, tool links and notes.");
    await hl("section:has-text('Checklist')"); await cap("A project: checklist", "Tick steps off as you go. The progress bar updates for the whole team."); await unhl(); },
  async () => { await go("/admin/tasks"); await cap("Tasks", "All tasks across leads and projects. Filter to Mine, a teammate's, or Everyone.");
    await hl("section:has-text('New task')"); await cap("Tasks: assign work", "Create a task, assign it and set a due date. The person gets notified by email."); await unhl(); },
  async () => { await go("/admin/clients"); await cap("Clients", "Every paying client with their package, monthly fee and setup fee. Monthly and yearly recurring revenue are worked out for you."); },
  async () => { await go("/admin/invoices"); await cap("Invoices", "Track what's been billed, paid and overdue. Create an invoice, then update its status as payments come in.", 5500); },
  async () => { await go("/admin/team"); await cap("Team (admins only)", "New account requests appear here. Approve them and switch on only what each person needs.", 5500);
    await hl("section:has-text('Pending requests')"); await cap("Team: permissions", "Admin, Sales, Outreach, Delivery, Finance, Marketing. People only see the parts of the dashboard they're allowed to use.", 6500); await unhl();
    await go("/admin/team/emails"); await cap("Team: email setup", "Admins only: the branded emails Supabase sends for password resets and invites, ready to copy."); },
  async () => { await go("/admin/account"); await cap("My account", "Update your name and personal email for notifications, and change your password."); },
  async () => { await go("/admin/connections"); await cap("Connections (admins only)", "Shows which services are switched on: Airtable, email, Groq and Gemini AI, Telegram alerts and more. Press Test to check one works.", 6500); },
  async () => { await p.setViewportSize({ width: 390, height: 720 }); await go("/admin"); await cap("On your phone", "The whole dashboard works on mobile. Use the bottom bar for Today, Outreach, Pipeline and Projects, and More for everything else.", 6500); await p.setViewportSize({ width: W, height: H }); },
  async () => card("Your daily rhythm", "1. Open Today &nbsp;·&nbsp; 2. Act on the top leads &nbsp;·&nbsp; 3. Log every call &nbsp;·&nbsp; 4. Tick your tasks", 6500),
  async () => card("Questions?", "Ask an admin, or check Connections if something looks off.<br/>oonava.com/admin", 4500),
];
total = scenes.length;
for (const s of scenes) { n++; try { await s(); } catch (e) { console.error("scene", n, e.message); } }
const v = p.video(); await ctx.close(); fs.writeFileSync(process.argv[4], JSON.stringify(LOG)); console.log(await v.path()); await b.close();
