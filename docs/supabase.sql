-- Oonava admin dashboard: team logins (Supabase Auth) and team data. Applied to project "Oonava Admin Dashboard".
-- Run in Supabase → SQL Editor, then set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.
-- Leads stay in Airtable. The website only talks to these tables server-side with the service-role key.

-- Profiles for Supabase Auth users. id = auth.users.id. Passwords live in Supabase Auth, not here.
create table if not exists team_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null unique,
  title text not null default '',
  permissions text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'active', 'disabled')),
  password_hash text,
  last_login timestamptz
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default '',
  client text not null default '',
  lead_id text,
  package text not null default '',
  stage text not null default 'Onboarding' check (stage in ('Onboarding','Building','Testing','Live','Support','Paused')),
  owner_id text,
  due_date date,
  setup_fee numeric not null default 0,
  monthly_fee numeric not null default 0,
  links text not null default '',
  notes text not null default ''
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  details text not null default '',
  assignee_id text,
  due_date date,
  done boolean not null default false,
  project_id text,
  lead_id text,
  created_by text
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null unique,
  client text not null default '',
  project_id text,
  kind text not null default 'Setup' check (kind in ('Setup','Monthly','Extra')),
  amount numeric not null default 0,
  currency text not null default 'EUR' check (currency in ('EUR','GBP')),
  due_date date,
  status text not null default 'Draft' check (status in ('Draft','Sent','Paid','Overdue','Cancelled')),
  paid_at timestamptz,
  notes text not null default ''
);

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text,
  user_name text not null default '',
  action text not null default '',
  target text not null default '',
  link text not null default ''
);

create index if not exists tasks_assignee_idx on tasks (assignee_id);
create index if not exists tasks_project_idx on tasks (project_id);
create index if not exists activity_created_idx on activity (created_at desc);
create index if not exists team_users_email_idx on team_users (email);

-- Lock the tables: no access with the public anon key, only the server's service-role key.
alter table team_users enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table invoices enable row level security;
alter table activity enable row level security;
revoke all on team_users, projects, tasks, invoices, activity from anon, authenticated;
