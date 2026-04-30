-- BuySupply Supabase Auth Profiles
-- ------------------------------------------------------------
-- Creates a `public.profiles` table linked 1:1 with `auth.users`,
-- enables RLS, and auto-creates a profile row on new user signup.
--
-- Run in Supabase SQL editor (or `supabase db reset/db push`).

-- 1) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_profiles_updated_at on public.profiles;
create trigger set_public_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 3) Enable RLS
alter table public.profiles enable row level security;

-- Grants (RLS policies determine access; grants just make permissions possible)
grant select, insert, update on public.profiles to authenticated;

-- 4) RLS policies
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

-- 5) Auto-create profile row on new auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', '')::text,
    nullif(new.raw_user_meta_data->>'avatar_url', '')::text
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

