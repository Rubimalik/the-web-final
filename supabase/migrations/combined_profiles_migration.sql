-- Combined BuySupply Supabase Auth Profiles Migration
-- Run this in Supabase SQL Editor (SQL → New query → Paste → Run)

-- ============================================================
-- 1) Base Profiles Table
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- updated_at trigger
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

-- Enable RLS
alter table public.profiles enable row level security;

grant select, insert, update on public.profiles to authenticated;

-- RLS policies
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
with check (
  auth.uid() = id
);

-- Auto-create profile on new user signup
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


-- ============================================================
-- 2) Role & Onboarding Columns
-- ============================================================

-- Add role column with default 'user'
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  add column if not exists onboarding_step integer not null default 0;

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Role constraint
drop constraint if exists profiles_role_check on public.profiles;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- Onboarding step constraint
drop constraint if exists profiles_onboarding_step_check on public.profiles;
alter table public.profiles
  add constraint profiles_onboarding_step_check
  check (onboarding_step >= 0 and onboarding_step <= 3);

-- Sync onboarding_completed with onboarding_step
create or replace function public.sync_onboarding_completed()
returns trigger
language plpgsql
as $$
begin
  if new.onboarding_step >= 3 then
    new.onboarding_completed = true;
  else
    new.onboarding_completed = false;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_onboarding_completed on public.profiles;
create trigger sync_onboarding_completed
before insert or update on public.profiles
for each row execute function public.sync_onboarding_completed();

-- Backfill onboarding_completed
update public.profiles
set onboarding_completed = onboarding_step >= 3;

-- Hardened insert policy (role spoofing protection)
drop policy if exists profiles_insert_own on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (
  auth.uid() = id
  and role = 'user'
  and onboarding_step >= 0
  and onboarding_step <= 1
  and onboarding_completed = false
);

-- Security: prevent client-side role/onboarding changes
create or replace function public.enforce_profile_sensitive_field_updates()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    if (new.role is distinct from old.role) then
      raise exception 'Role changes are not allowed via client-side requests.';
    end if;

    if (new.onboarding_step is distinct from old.onboarding_step)
      or (new.onboarding_completed is distinct from old.onboarding_completed) then
      raise exception 'Onboarding updates are not allowed via client-side requests.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_sensitive_field_updates on public.profiles;
create trigger enforce_profile_sensitive_field_updates
before update on public.profiles
for each row execute function public.enforce_profile_sensitive_field_updates();


-- ============================================================
-- 3) Dealer Fields
-- ============================================================

-- Expand role constraint to include 'dealer'
drop constraint if exists profiles_role_check on public.profiles;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'dealer', 'admin'));

-- Add dealer-specific fields
alter table public.profiles
  add column if not exists dealer_status text not null default 'pending';

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists approved_at timestamptz;

-- Dealer status constraint
drop constraint if exists profiles_dealer_status_check on public.profiles;
alter table public.profiles
  add constraint profiles_dealer_status_check
  check (dealer_status in ('pending', 'approved', 'rejected', 'suspended'));

-- Update security trigger to protect dealer fields
create or replace function public.enforce_profile_sensitive_field_updates()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    if (new.role is distinct from old.role) then
      raise exception 'Role changes are not allowed via client-side requests.';
    end if;

    if (new.onboarding_step is distinct from old.onboarding_step)
      or (new.onboarding_completed is distinct from old.onboarding_completed) then
      raise exception 'Onboarding updates are not allowed via client-side requests.';
    end if;

    if (new.dealer_status is distinct from old.dealer_status)
      or (new.approved_at is distinct from old.approved_at) then
      raise exception 'Dealer approval changes are not allowed via client-side requests.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_sensitive_field_updates on public.profiles;
create trigger enforce_profile_sensitive_field_updates
before update on public.profiles
for each row execute function public.enforce_profile_sensitive_field_updates();
