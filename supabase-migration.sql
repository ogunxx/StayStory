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

-- ── PORTFOLIO: PROPERTIES + CO-HOST TEAM ACCESS ─────────────────────────────
-- A property is owned by one host (properties.user_id). Portfolio plans may run
-- several. Co-hosts are granted access to a property via property_members.

-- The properties table already exists in this database. Ensure the columns the
-- app relies on are present (no-ops if they already are).
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text,
  description text,
  created_at timestamptz default now() not null
);

alter table properties add column if not exists type text;
alter table properties add column if not exists description text;

alter table properties enable row level security;

-- Owners manage their own properties.
do $$ begin
  create policy "Owners manage own properties"
    on properties for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- property_members is created before the properties co-host policy below,
-- because that policy references this table and Postgres validates the
-- reference at creation time.

create table if not exists property_members (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties on delete cascade not null,
  owner_id uuid references auth.users on delete cascade not null,
  user_id uuid references auth.users on delete cascade,
  email text not null,
  role text not null default 'cohost',
  status text not null default 'invited',
  created_at timestamptz default now() not null,
  unique (property_id, email)
);

alter table property_members enable row level security;

-- The property owner manages the team. Co-hosts can see the rows that belong
-- to them (so the app can resolve their access).
do $$ begin
  create policy "Owners manage property members"
    on property_members for all
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Members can read own membership"
    on property_members for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Co-hosts can read the properties they're a member of. Created after
-- property_members exists so the reference resolves.
do $$ begin
  create policy "Members can read properties they belong to"
    on properties for select
    using (
      exists (
        select 1 from property_members m
        where m.property_id = properties.id and m.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- ── PER-PROPERTY SCOPING ────────────────────────────────────────────────────
-- Tag each piece of generated data with the property it belongs to. Nullable so
-- existing rows stay valid ("unassigned"); on property delete the data is kept
-- but its property_id is cleared rather than cascade-deleted.

alter table audits           add column if not exists property_id uuid references properties on delete set null;
alter table suggestions      add column if not exists property_id uuid references properties on delete set null;
alter table guest_stories    add column if not exists property_id uuid references properties on delete set null;
alter table journey_sessions add column if not exists property_id uuid references properties on delete set null;
alter table playbooks        add column if not exists property_id uuid references properties on delete set null;

create index if not exists audits_property_id_idx           on audits (property_id);
create index if not exists suggestions_property_id_idx      on suggestions (property_id);
create index if not exists guest_stories_property_id_idx    on guest_stories (property_id);
create index if not exists journey_sessions_property_id_idx on journey_sessions (property_id);
create index if not exists playbooks_property_id_idx        on playbooks (property_id);
