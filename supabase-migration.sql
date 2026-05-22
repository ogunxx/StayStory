-- ── NEW TABLES ──────────────────────────────────────────────────────────────

create table if not exists journey_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  touchpoint text not null,
  ideas jsonb,
  created_at timestamptz default now() not null
);

alter table journey_sessions enable row level security;

do $$ begin
  create policy "Users can insert own journey sessions"
    on journey_sessions for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can read own journey sessions"
    on journey_sessions for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────────

create table if not exists playbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  property_name text,
  executive_summary text,
  created_at timestamptz default now() not null
);

alter table playbooks enable row level security;

do $$ begin
  create policy "Users can insert own playbooks"
    on playbooks for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can read own playbooks"
    on playbooks for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── INSERT POLICIES FOR EXISTING TABLES ─────────────────────────────────────

do $$ begin
  create policy "Users can insert own guest stories"
    on guest_stories for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert own audits"
    on audits for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
