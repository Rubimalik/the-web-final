-- Admin/dealer profile hardening.
-- Keeps public.profiles as the database source of truth for admin access.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping admin profile hardening because public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    add column if not exists role text not null default 'user';

  alter table public.profiles
    add column if not exists onboarding_step integer not null default 0;

  alter table public.profiles
    add column if not exists onboarding_completed boolean not null default false;

  alter table public.profiles
    add column if not exists dealer_status text not null default 'none';

  alter table public.profiles
    add column if not exists company_name text;

  alter table public.profiles
    add column if not exists dealer_notes text;

  alter table public.profiles
    add column if not exists approved_at timestamptz;

  alter table public.profiles
    add column if not exists admin_permissions jsonb not null default '{}'::jsonb;

  alter table public.profiles
    alter column role set default 'user';

  alter table public.profiles
    alter column dealer_status set default 'none';

  update public.profiles
  set dealer_status = 'none'
  where dealer_status = 'pending'
    and role <> 'dealer'
    and company_name is null;

  alter table public.profiles
    drop constraint if exists profiles_role_check;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'dealer', 'admin'));

  alter table public.profiles
    drop constraint if exists profiles_dealer_status_check;

  alter table public.profiles
    add constraint profiles_dealer_status_check
    check (dealer_status in ('none', 'pending', 'approved', 'rejected', 'suspended'));

  alter table public.profiles
    drop constraint if exists profiles_onboarding_step_check;

  alter table public.profiles
    add constraint profiles_onboarding_step_check
    check (onboarding_step >= 0 and onboarding_step <= 3);

  create index if not exists profiles_role_idx
    on public.profiles (role);

  create index if not exists profiles_dealer_status_idx
    on public.profiles (dealer_status);

  create index if not exists profiles_created_at_idx
    on public.profiles (created_at);

  create index if not exists profiles_company_name_idx
    on public.profiles (company_name);

  create or replace function public.sync_onboarding_completed()
  returns trigger
  language plpgsql
  as $function$
  begin
    new.onboarding_completed = new.onboarding_step >= 3;
    return new;
  end;
  $function$;

  drop trigger if exists sync_onboarding_completed on public.profiles;
  create trigger sync_onboarding_completed
  before insert or update on public.profiles
  for each row execute function public.sync_onboarding_completed();

  create or replace function public.enforce_profile_sensitive_field_updates()
  returns trigger
  language plpgsql
  as $function$
  begin
    if auth.role() <> 'service_role' then
      if (new.role is distinct from old.role) then
        raise exception 'Role changes are not allowed via client-side requests.';
      end if;

      if (new.admin_permissions is distinct from old.admin_permissions) then
        raise exception 'Admin permission changes are not allowed via client-side requests.';
      end if;

      if (new.onboarding_step is distinct from old.onboarding_step)
        or (new.onboarding_completed is distinct from old.onboarding_completed) then
        raise exception 'Onboarding updates are not allowed via client-side requests.';
      end if;

      if (new.dealer_status is distinct from old.dealer_status)
        or (new.approved_at is distinct from old.approved_at)
        or (new.dealer_notes is distinct from old.dealer_notes) then
        raise exception 'Dealer approval changes are not allowed via client-side requests.';
      end if;
    end if;

    return new;
  end;
  $function$;

  drop trigger if exists enforce_profile_sensitive_field_updates on public.profiles;
  create trigger enforce_profile_sensitive_field_updates
  before update on public.profiles
  for each row execute function public.enforce_profile_sensitive_field_updates();

  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $function$
  begin
    insert into public.profiles (
      id,
      full_name,
      avatar_url,
      role,
      onboarding_step,
      onboarding_completed,
      dealer_status
    )
    values (
      new.id,
      nullif(new.raw_user_meta_data->>'full_name', '')::text,
      nullif(new.raw_user_meta_data->>'avatar_url', '')::text,
      'user',
      case
        when nullif(new.raw_user_meta_data->>'full_name', '') is null then 0
        else 1
      end,
      false,
      'none'
    )
    on conflict (id) do nothing;

    return new;
  end;
  $function$;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

  alter table public.profiles enable row level security;
  grant select, insert, update on public.profiles to authenticated;

  drop policy if exists "profiles_select_own" on public.profiles;
  create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

  drop policy if exists "profiles_update_own" on public.profiles;
  create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

  drop policy if exists "profiles_insert_own" on public.profiles;
  create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (
    auth.uid() = id
    and role = 'user'
    and onboarding_step >= 0
    and onboarding_step <= 1
    and onboarding_completed = false
    and dealer_status = 'none'
    and admin_permissions = '{}'::jsonb
  );
end;
$$;
