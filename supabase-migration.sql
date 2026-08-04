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

-- ── EXPERIENCE COMPASS ───────────────────────────────────────────────────────
-- One living per-property (or per-user, if no property yet) document holding
-- the 7 Experience Compass elements. Values are only ever written through
-- compass_contributions (below) so every change — AI-suggested or a direct
-- host edit — has a recorded source and can be reviewed before being applied
-- (no field here is ever silently decided by the AI). field_provenance is a
-- small denormalized pointer to the *currently applied* source per field, kept
-- in sync with compass_contributions so reads (e.g. the Generator) don't need
-- a join on every call.

create table if not exists experience_compass (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete set null,
  status text not null default 'preliminary'
    check (status in ('preliminary', 'developing', 'confirmed', 'evolving')),
  wonder text,
  purpose text,
  story text,
  transformation_arrive text,
  transformation_leave text,
  hospitality_promise text,
  signature_memory text,
  story_theyll_tell text,
  field_provenance jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- One compass per property; one per user for the "no property yet" case.
create unique index if not exists experience_compass_property_uidx
  on experience_compass (property_id) where property_id is not null;
create unique index if not exists experience_compass_user_unassigned_uidx
  on experience_compass (user_id) where property_id is null;
create index if not exists experience_compass_user_id_idx on experience_compass (user_id);

alter table experience_compass enable row level security;

do $$ begin
  create policy "Owners manage own compass"
    on experience_compass for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- compass_contributions is the append-only review queue AND audit trail: every
-- proposed field value (source_module = 'story_builder', 'audit', ... or
-- 'host' for a direct edit) lands here as 'pending' (or 'accepted' immediately
-- for direct host edits), and is reviewed via accept/reject before it ever
-- reaches the compass row itself.

create table if not exists compass_contributions (
  id uuid primary key default gen_random_uuid(),
  compass_id uuid references experience_compass on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete set null,
  field text not null check (field in (
    'wonder', 'purpose', 'story', 'transformation_arrive', 'transformation_leave',
    'hospitality_promise', 'signature_memory', 'story_theyll_tell'
  )),
  suggested_value text not null,
  source_module text not null,
  source_ref jsonb,
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now() not null,
  reviewed_at timestamptz
);

create index if not exists compass_contributions_compass_id_idx on compass_contributions (compass_id);
create index if not exists compass_contributions_pending_idx on compass_contributions (compass_id, status) where status = 'pending';

alter table compass_contributions enable row level security;

do $$ begin
  create policy "Owners manage own compass contributions"
    on compass_contributions for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── FIX PROPERTY TYPE CHECK CONSTRAINT ──────────────────────────────────────
-- The "Add property" form used to be free text, which could produce a type
-- value outside whatever this constraint currently allows (observed failure:
-- "violates check constraint properties_type_check"). Redefine it to exactly
-- match the fixed set the UI now offers, so the two can never drift again.

alter table properties drop constraint if exists properties_type_check;
alter table properties add constraint properties_type_check
  check (type is null or type in ('rv', 'cabin', 'house', 'apartment', 'tiny_house', 'wellness', 'other'));

-- ── ADMIN: SUSPEND + AUDIT LOG ──────────────────────────────────────────────
-- suspended_at is nullable (unsuspended = null). Checked at the top of the
-- dashboard layout so a suspended user is signed out on their next request.

alter table profiles add column if not exists suspended_at timestamptz;

-- Append-only record of every admin write action (tier change, suspend,
-- reactivate) — who did it, to whom, what changed, when. Only ever written
-- via the service-role client from an already admin-gated route; RLS is
-- enabled with no policies, so it's unreachable through the normal
-- user-scoped client regardless.

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users on delete set null,
  target_user_id uuid references auth.users on delete set null,
  action text not null check (action in ('tier_change', 'suspend', 'reactivate')),
  previous_value text,
  new_value text,
  created_at timestamptz default now() not null
);

create index if not exists admin_actions_target_user_id_idx on admin_actions (target_user_id);

alter table admin_actions enable row level security;
