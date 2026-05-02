-- StayStory — Run this in your Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  tier text not null default 'free' check (tier in ('free', 'host', 'signature', 'legend')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Properties
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('rv', 'cabin', 'house', 'apartment', 'tiny_house', 'wellness', 'other')),
  description text,
  created_at timestamptz default now()
);

alter table public.properties enable row level security;

create policy "Users manage their own properties"
  on public.properties for all using (auth.uid() = user_id);

-- Guests
create table if not exists public.guests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  name text,
  arrival_date date,
  why_visiting text,
  host_notes text,
  occasion text,
  emotional_state text,
  has_kids boolean default false,
  has_pets boolean default false,
  interests text,
  budget text check (budget in ('zero', 'under_10', 'under_25', 'premium')) default 'under_10',
  created_at timestamptz default now()
);

alter table public.guests enable row level security;

create policy "Users manage their own guests"
  on public.guests for all using (auth.uid() = user_id);

-- Suggestions (generator output)
create table if not exists public.suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  guest_id uuid references public.guests(id) on delete set null,
  level integer check (level in (1, 2, 3, 4)) default 3,
  content jsonb not null,
  created_at timestamptz default now()
);

alter table public.suggestions enable row level security;

create policy "Users manage their own suggestions"
  on public.suggestions for all using (auth.uid() = user_id);

-- Audits (foundation audit results)
create table if not exists public.audits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  responses jsonb not null default '{}',
  score integer default 0,
  created_at timestamptz default now()
);

alter table public.audits enable row level security;

create policy "Users manage their own audits"
  on public.audits for all using (auth.uid() = user_id);

-- Guest stories
create table if not exists public.guest_stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  guest_id uuid references public.guests(id) on delete set null,
  narrative text,
  host_perspective text,
  social_caption text,
  pre_arrival_message text,
  listing_improvements text,
  created_at timestamptz default now()
);

alter table public.guest_stories enable row level security;

create policy "Users manage their own stories"
  on public.guest_stories for all using (auth.uid() = user_id);
