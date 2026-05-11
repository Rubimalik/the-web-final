-- Final RBAC refinement for manual access control.
-- This migration is safe to run after either earlier RBAC migration.

do $migration$
begin
  if to_regclass('auth.users') is null or to_regclass('public.profiles') is null then
    raise notice 'Skipping access-control refinement because auth.users or public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    add column if not exists account_status text not null default 'active';

  alter table public.profiles
    add column if not exists suspended_at timestamptz;

  alter table public.profiles
    add column if not exists suspended_by uuid references auth.users(id) on delete set null;

  alter table public.profiles
    add column if not exists suspension_reason text;

  alter table public.profiles
    add column if not exists dealer_access_code text;

  alter table public.profiles
    drop constraint if exists profiles_account_status_check;

  alter table public.profiles
    add constraint profiles_account_status_check
    check (account_status in ('active', 'suspended'));

  create table if not exists public.user_roles (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null,
    assigned_by uuid references auth.users(id) on delete set null,
    assigned_at timestamptz not null default now(),
    revoked_at timestamptz,
    revoked_by uuid references auth.users(id) on delete set null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_roles_role_check check (role in ('customer', 'dealer', 'admin')),
    constraint user_roles_user_role_key unique(user_id, role),
    constraint user_roles_revocation_check check (
      (revoked_at is null and revoked_by is null)
      or (revoked_at is not null and revoked_by is not null)
    )
  );

  create index if not exists profiles_account_status_idx on public.profiles(account_status);
  create index if not exists user_roles_user_id_idx on public.user_roles(user_id);
  create index if not exists user_roles_role_idx on public.user_roles(role);
  create index if not exists user_roles_active_idx
    on public.user_roles(user_id, role)
    where revoked_at is null;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and conname = 'user_roles_user_id_fkey'
  ) then
    alter table public.user_roles
      add constraint user_roles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  execute $sql$
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

        if (new.account_status is distinct from old.account_status)
          or (new.suspended_at is distinct from old.suspended_at)
          or (new.suspended_by is distinct from old.suspended_by)
          or (new.suspension_reason is distinct from old.suspension_reason) then
          raise exception 'Account access changes are not allowed via client-side requests.';
        end if;

        if (new.onboarding_step is distinct from old.onboarding_step)
          or (new.onboarding_completed is distinct from old.onboarding_completed) then
          raise exception 'Onboarding updates are not allowed via client-side requests.';
        end if;

        if (new.dealer_status is distinct from old.dealer_status)
          or (new.approved_at is distinct from old.approved_at)
          or (new.dealer_notes is distinct from old.dealer_notes)
          or (new.dealer_access_code is distinct from old.dealer_access_code) then
          raise exception 'Dealer approval changes are not allowed via client-side requests.';
        end if;
      end if;

      return new;
    end;
    $function$;
  $sql$;

  execute $sql$
    create or replace function public.get_user_active_roles(target_user_id uuid)
    returns table(role text, assigned_at timestamptz, assigned_by uuid)
    language sql
    stable
    security definer
    set search_path = public
    as $function$
      select
        ur.role,
        ur.assigned_at,
        ur.assigned_by
      from public.user_roles ur
      where ur.user_id = target_user_id
        and ur.revoked_at is null
      order by ur.assigned_at desc;
    $function$;
  $sql$;

  execute $sql$
    create or replace function public.has_user_role(target_user_id uuid, required_role text)
    returns boolean
    language sql
    stable
    security definer
    set search_path = public
    as $function$
      select exists(
        select 1
        from public.user_roles ur
        where ur.user_id = target_user_id
          and ur.role = required_role
          and ur.revoked_at is null
      );
    $function$;
  $sql$;

  alter table public.user_roles enable row level security;

  drop policy if exists "user_roles_select_own" on public.user_roles;
  create policy "user_roles_select_own"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

  drop policy if exists "user_roles_admin_full_access" on public.user_roles;
  create policy "user_roles_admin_full_access"
  on public.user_roles
  for all
  using (public.has_user_role(auth.uid(), 'admin'))
  with check (public.has_user_role(auth.uid(), 'admin'));

  revoke all on public.user_roles from anon;
  revoke insert, update, delete on public.user_roles from authenticated;
  grant select on public.user_roles to authenticated;
  grant all on public.user_roles to service_role;

  execute $sql$
    create or replace view public.user_roles_summary as
    select
      p.id as user_id,
      p.full_name,
      au.email,
      coalesce(array_agg(distinct ur.role order by ur.role) filter (where ur.revoked_at is null), array[]::text[]) as active_roles,
      coalesce(array_agg(distinct ur.role order by ur.role) filter (where ur.revoked_at is not null), array[]::text[]) as revoked_roles,
      max(ur.assigned_at) filter (where ur.revoked_at is null) as last_role_assignment,
      count(*) filter (where ur.revoked_at is null) as active_role_count,
      p.account_status,
      p.dealer_status,
      p.company_name,
      p.dealer_notes,
      p.suspended_at,
      p.suspended_by,
      p.suspension_reason,
      p.created_at,
      p.updated_at
    from public.profiles p
    left join auth.users au on au.id = p.id
    left join public.user_roles ur on ur.user_id = p.id
    group by
      p.id,
      p.full_name,
      au.email,
      p.account_status,
      p.dealer_status,
      p.company_name,
      p.dealer_notes,
      p.suspended_at,
      p.suspended_by,
      p.suspension_reason,
      p.created_at,
      p.updated_at;
  $sql$;

  revoke all on public.user_roles_summary from anon;
  grant select on public.user_roles_summary to service_role;
end;
$migration$;
