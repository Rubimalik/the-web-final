-- BuySupply Supabase Auth Profiles
-- ------------------------------------------------------------
-- Step-based onboarding + stronger security guarantees.

-- ROLE: only 'user'/'admin' allowed (default 'user')
alter table public.profiles
  alter column role set default 'user';

drop constraint if exists profiles_role_check on public.profiles;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- ONBOARDING: replace boolean-only with step-based system
alter table public.profiles
  add column if not exists onboarding_step integer not null default 0;

drop constraint if exists profiles_onboarding_step_check on public.profiles;
alter table public.profiles
  add constraint profiles_onboarding_step_check
  check (onboarding_step >= 0 and onboarding_step <= 3);

alter table public.profiles
  alter column onboarding_completed set default false;

-- Keep onboarding_completed synced with onboarding_step
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

-- Backfill onboarding_completed from onboarding_step
update public.profiles
set onboarding_completed = onboarding_step >= 3;

-- Replace auto-profile trigger so:
-- - role is ALWAYS default 'user' (no client/app_metadata role injection)
-- - onboarding_step starts at 1 when full_name is present (signup captured profile setup)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, onboarding_step, onboarding_completed)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', '')::text,
    nullif(new.raw_user_meta_data->>'avatar_url', '')::text,
    'user'::text,
    case
      when nullif(new.raw_user_meta_data->>'full_name', '') is null then 0
      else 1
    end,
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Ensure this trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY HARDENING:
-- Prevent role/onboarding changes from client-side updates.
-- Only service_role (server/admin logic) can update these sensitive fields.
create or replace function public.enforce_profile_sensitive_field_updates()
returns trigger
language plpgsql
as $$
begin
  -- auth.role() is derived from the JWT used by Supabase.
  -- Service-role requests bypass RLS but still execute triggers.
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

