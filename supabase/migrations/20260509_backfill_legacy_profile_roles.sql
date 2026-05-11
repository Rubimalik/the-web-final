-- Backfill RBAC rows for accounts that still rely on legacy public.profiles.role.
-- Revoked user_roles rows are intentionally left untouched because revocation must win.

do $$
begin
  if to_regclass('auth.users') is null
    or to_regclass('public.profiles') is null
    or to_regclass('public.user_roles') is null then
    raise notice 'Skipping legacy profile role backfill because required tables do not exist.';
    return;
  end if;

  insert into public.user_roles (user_id, role, assigned_by, notes)
  select p.id, 'admin', p.id, 'Backfilled from legacy profiles.role'
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'admin'
    and coalesce(p.account_status, 'active') = 'active'
  on conflict (user_id, role) do nothing;

  insert into public.user_roles (user_id, role, assigned_by, notes)
  select p.id, 'dealer', p.id, 'Backfilled from legacy profiles.role'
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'dealer'
    and p.dealer_status = 'approved'
    and coalesce(p.account_status, 'active') = 'active'
  on conflict (user_id, role) do nothing;
end;
$$;
