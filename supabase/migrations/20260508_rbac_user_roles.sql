-- Role-Based Access Control (RBAC) System
-- Allows admins to manually assign roles to users
-- Supports multiple roles per user: customer, dealer, admin

do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping user_roles RBAC setup because public.profiles does not exist.';
    return;
  end if;

  -- Create user_roles table
  create table if not exists public.user_roles (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid not null,
    role text not null check (role in ('customer', 'dealer', 'admin')),
    assigned_by uuid references auth.users(id) on delete set null,
    assigned_at timestamptz not null default now(),
    revoked_at timestamptz,
    revoked_by uuid references auth.users(id) on delete set null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id, role),
    constraint valid_revocation check (
      (revoked_at is null and revoked_by is null)
      or (revoked_at is not null and revoked_by is not null)
    )
  );

  -- Create indexes for common queries
  create index if not exists user_roles_user_id_idx on public.user_roles(user_id);
  create index if not exists user_roles_role_idx on public.user_roles(role);
  create index if not exists user_roles_active_idx on public.user_roles(user_id, role) where revoked_at is null;
  create index if not exists user_roles_assigned_by_idx on public.user_roles(assigned_by);
  create index if not exists user_roles_assigned_at_idx on public.user_roles(assigned_at);

  -- Function to get user's active roles
  create or replace function public.get_user_active_roles(user_id uuid)
  returns table(role text, assigned_at timestamptz, assigned_by uuid) as $$
  select
    ur.role,
    ur.assigned_at,
    ur.assigned_by
  from public.user_roles ur
  where ur.user_id = get_user_active_roles.user_id
    and ur.revoked_at is null
  order by ur.assigned_at desc;
  $$ language sql stable;

  -- Function to check if user has specific role
  create or replace function public.has_user_role(user_id uuid, required_role text)
  returns boolean as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.user_id = has_user_role.user_id
      and ur.role = has_user_role.required_role
      and ur.revoked_at is null
  );
  $$ language sql stable;

  -- RLS Policies for user_roles
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
  using (public.has_user_role(auth.uid(), 'admin'));

  -- Grant permissions
  grant select on public.user_roles to authenticated;
  grant all on public.user_roles to authenticated; -- Will be limited by RLS

  -- Create a view for admin dashboard
  create or replace view public.user_roles_summary as
  select
    p.id as user_id,
    p.full_name,
    au.email,
    array_agg(distinct ur.role order by ur.role) filter (where ur.revoked_at is null) as active_roles,
    array_agg(distinct ur.role order by ur.role) filter (where ur.revoked_at is not null) as revoked_roles,
    max(ur.assigned_at) filter (where ur.revoked_at is null) as last_role_assignment,
    count(*) filter (where ur.revoked_at is null) as active_role_count,
    p.created_at,
    p.updated_at
  from public.profiles p
  left join auth.users au on au.id = p.id
  left join public.user_roles ur on ur.user_id = p.id
  group by p.id, p.full_name, au.email, p.created_at, p.updated_at;

  grant select on public.user_roles_summary to authenticated;

end;
$$;
