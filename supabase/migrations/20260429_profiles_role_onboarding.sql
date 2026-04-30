-- BuySupply Supabase Auth Profiles (role + onboarding)
-- ------------------------------------------------------------
-- Adds:
-- - role (with constraint)
-- - onboarding_completed
--
-- Also updates the `handle_new_user()` trigger function to populate
-- role from `auth.users.raw_app_meta_data`.

-- 1) Add columns
alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists onboarding_completed boolean not null default false;

-- 2) Add role constraint (replace if already exists)
drop constraint if exists profiles_role_check on public.profiles;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'user'));

-- 3) Backfill roles for existing profiles from auth.users app_metadata
update public.profiles p
set role = coalesce(
  (select u.raw_app_meta_data->>'role' from auth.users u where u.id = p.id),
  'user'
)
where p.role is distinct from coalesce(
  (select u.raw_app_meta_data->>'role' from auth.users u where u.id = p.id),
  'user'
);

-- 4) Update profile auto-create trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, onboarding_completed)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', '')::text,
    nullif(new.raw_user_meta_data->>'avatar_url', '')::text,
    coalesce(nullif(new.raw_app_meta_data->>'role', ''), 'user')::text,
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

