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

-- ── EXPERIENCE BLUEPRINT: PERSIST THE FULL MAP ──────────────────────────────
-- Previously only individual idea-generation events were saved (journey_sessions,
-- touchpoint + ideas only) — the host's "what you currently do" answers and the
-- property-context note lived only in React state and were lost on refresh.
-- This table holds the live, editable state of the whole Blueprint; journey_sessions
-- remains as-is as the historical log of generation events (still used by History).

create table if not exists experience_blueprint (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete set null,
  property_context text,
  touchpoints jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists experience_blueprint_property_uidx
  on experience_blueprint (property_id) where property_id is not null;
create unique index if not exists experience_blueprint_user_unassigned_uidx
  on experience_blueprint (user_id) where property_id is null;

alter table experience_blueprint enable row level security;

do $$ begin
  create policy "Owners manage own blueprint"
    on experience_blueprint for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── SITE CONFIG ─────────────────────────────────────────────────────────────
-- Small key/value store for figures the marketing site states publicly — right
-- now the Airbnb rating and review count, which appear in the Proof section,
-- the final CTA line, and the founder story. All three read this one row set,
-- so updating a value here changes every claim on the site at once.
--
-- The table already exists in production (created by hand before this file
-- tracked it); this block is idempotent so it's safe either way.
--
-- Written only through the admin-gated /api/admin/site-config route using the
-- service-role client. RLS is enabled with no policies, so it is unreachable
-- from the normal user-scoped client — reads happen server-side.

create table if not exists site_config (
  key text primary key,
  value text,
  updated_at timestamptz default now() not null
);

alter table site_config enable row level security;

insert into site_config (key, value) values
  ('airbnb_rating', '4.99'),
  ('airbnb_review_count', '136')
on conflict (key) do nothing;

-- ── EXPERIENCE AUDIT: IN-PROGRESS DRAFTS ────────────────────────────────────
-- The Audit is now eight guided steps rather than one form, so a host needs to
-- be able to leave and come back. `audits` still stores completed runs; this
-- holds the one unfinished draft per property while it's being worked on, and
-- is deleted when the Audit is submitted.
--
-- Same shape as experience_compass: one row per property, plus one per user
-- for the "no property yet" case.

create table if not exists audit_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete cascade,
  step_index int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists audit_drafts_property_uidx
  on audit_drafts (property_id) where property_id is not null;
create unique index if not exists audit_drafts_user_unassigned_uidx
  on audit_drafts (user_id) where property_id is null;
create index if not exists audit_drafts_user_id_idx on audit_drafts (user_id);

alter table audit_drafts enable row level security;

do $$ begin
  create policy "Owners manage own audit drafts"
    on audit_drafts for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ── SIGNUP IP GUARD ─────────────────────────────────────────────────────────
-- One free account per connection. The table was created directly against the
-- project before this file tracked it, so it is written down here now — the
-- live table already matches this definition, which is why every statement is
-- idempotent.
--
-- Written and read only by /api/auth/record-signup and /api/auth/check-signup,
-- both of which use the service-role key. Service role bypasses RLS entirely,
-- so RLS with no policies at all is the tightest correct setting: the guard
-- keeps working, and the table is unreachable through the user-scoped client.
--
-- The grants matter as much as the RLS. TRUNCATE is never subject to row level
-- security — it is governed by table privileges alone — so leaving anon with
-- its default grants would have let anyone empty the table and defeat the
-- guard without ever reading a row. Hence the revoke.
--
-- See src/lib/signup-guard.ts for when the guard applies (production only).

create table if not exists signup_ips (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz default now()
);

create index if not exists idx_signup_ips_ip on signup_ips (ip);

alter table signup_ips enable row level security;

revoke all on signup_ips from anon, authenticated;

-- ── NEW USER → PROFILE ROW ──────────────────────────────────────────────────
-- What actually creates a profiles row when someone signs up. Like signup_ips,
-- it was created directly against the project before this file tracked it, so
-- it is written down here now; the live objects already match.
--
-- search_path is pinned to empty and the body fully qualifies public.profiles.
-- A SECURITY DEFINER function runs as its owner, so any unqualified name it
-- resolved at run time could be shadowed by an object planted earlier in the
-- caller's search_path. Nothing in profiles depends on a mutable search_path
-- (its only defaults are now(), a literal and false), so pinning it changes
-- nothing about how this runs.
--
-- The grants are the other half. PUBLIC held EXECUTE, which exposed the
-- function at /rest/v1/rpc/handle_new_user to anyone holding the anon key.
-- EXECUTE on a trigger function is checked when the trigger is created, not
-- each time it fires, so revoking does not stop on_auth_user_created — that
-- was verified against the database rather than assumed. The grant to
-- supabase_auth_admin is explicit insurance: the auth service owns auth.users
-- and is what makes the trigger fire.

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $function$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to postgres, supabase_auth_admin;

-- Needs ownership of auth.users, so this runs as postgres (the SQL editor
-- does). Guarded so re-running the file is a no-op.
do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception when duplicate_object then null; end $$;

-- ── FOCUSED JOURNEY: OPTIONAL CLOSING FEEDBACK ──────────────────────────────
-- Feedback on the StayStory experience itself, offered after the Starter
-- Playbook. Not a product stage — the journey is four steps and ends there.
--
-- A dedicated table rather than another `kind` inside `suggestions`: three
-- queries already special-case the focused kinds in that table, admin needs to
-- filter and sort by review status (awkward through jsonb), and this is
-- feedback about StayStory rather than a suggestion for a property.

create table if not exists focused_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  -- Null is legitimate: the focused journey works before a property exists.
  property_id uuid references properties on delete set null,
  usefulness smallint not null check (usefulness between 1 and 5),
  most_valuable text check (most_valuable in ('audit','compass','opportunities','starter_playbook','whole_journey','something_else')),
  most_valuable_other text check (most_valuable_other is null or char_length(most_valuable_other) <= 500),
  improvement_feedback text check (improvement_feedback is null or char_length(improvement_feedback) <= 4000),
  additional_feedback text check (additional_feedback is null or char_length(additional_feedback) <= 4000),
  open_to_followup boolean not null default false,
  -- Internal workflow only. The column grants below are what stop a host
  -- setting this themselves.
  review_status text not null default 'new' check (review_status in ('new','reviewed','follow_up')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per host per property: this is what makes a returning host update
-- their answers instead of leaving a trail of duplicates. On (user_id,
-- property_id) rather than property alone, because a property can have
-- co-hosts and each is entitled to their own answer.
create unique index if not exists focused_feedback_user_property_uidx
  on focused_feedback (user_id, property_id) where property_id is not null;
create unique index if not exists focused_feedback_user_unassigned_uidx
  on focused_feedback (user_id) where property_id is null;

create index if not exists focused_feedback_created_at_idx on focused_feedback (created_at desc);
create index if not exists focused_feedback_review_status_idx on focused_feedback (review_status);

alter table focused_feedback enable row level security;

-- Read, create and update their own. No delete policy on purpose: a host
-- withdrawing feedback should be a conversation, not a row quietly vanishing.
do $$ begin
  create policy "Owners read own feedback" on focused_feedback
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owners create own feedback" on focused_feedback
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owners update own feedback" on focused_feedback
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- RLS decides which ROWS a host may touch; it cannot restrict COLUMNS. Column
-- grants can, and that is what stops a host setting their own review_status by
-- calling the REST API directly with their own token.
revoke all on focused_feedback from anon;
revoke update on focused_feedback from authenticated;
grant update (usefulness, most_valuable, most_valuable_other, improvement_feedback,
              additional_feedback, open_to_followup, updated_at)
  on focused_feedback to authenticated;

-- ── HOST RESEARCH: WHAT HOSTS NEED, ASKED ON THE PUBLIC HOMEPAGE ────────────
-- Deliberately NOT focused_feedback. That table answers "did StayStory help?"
-- and belongs to a signed-in host who finished the Starter Playbook. This one
-- answers "what do hospitality hosts need?" and comes from an anonymous
-- visitor who may never have used the product. Two questions, two moments,
-- two datasets, kept apart on purpose.

create table if not exists host_research (
  id uuid primary key default gen_random_uuid(),

  -- Their answers.
  property_type text not null check (property_type in (
    'vacation_rental', 'cabin_tiny_home', 'boutique',
    'bed_and_breakfast', 'other', 'preparing')),
  property_type_other text,
  biggest_challenge text not null check (length(biggest_challenge) between 1 and 4000),
  desired_support text check (length(desired_support) <= 4000),
  testing_interest text not null check (testing_interest in ('yes', 'maybe', 'not_right_now')),
  name text,
  email text not null,

  -- Permission to reply about this research. NOT a marketing subscription,
  -- and there is no subscriber table for it to feed.
  contact_permission boolean not null default true,

  -- Where the submission came from, so a second entry point later is
  -- distinguishable without guessing from timestamps.
  submission_source text not null default 'homepage',

  -- One form interaction, one key. A double click, a retry or a flaky
  -- network replays the same key and the unique index below turns the second
  -- insert into a no-op rather than a duplicate row. Email is deliberately
  -- NOT unique: the same host may legitimately answer again months later.
  idempotency_key text not null,

  -- Ours, never theirs. See the grants at the bottom.
  admin_status text not null default 'new' check (admin_status in ('new', 'reviewed', 'follow_up')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists host_research_idempotency_key_idx
  on host_research (idempotency_key);
create index if not exists host_research_created_at_idx on host_research (created_at desc);
create index if not exists host_research_admin_status_idx on host_research (admin_status);
-- Finding people willing to test is the main reason this form exists.
create index if not exists host_research_testing_interest_idx on host_research (testing_interest);

alter table host_research enable row level security;

-- No policies, on purpose.
--
-- RLS with zero policies denies everything to anon and authenticated, which
-- is exactly right here: there is no row a signed-in host should read, and
-- nothing a visitor should read back. Inserts come from the server through
-- the service-role client, which bypasses RLS, after server-side validation
-- that builds the row field by field. So the browser never needs INSERT, and
-- never gets it.
revoke all on host_research from anon;
revoke all on host_research from authenticated;
