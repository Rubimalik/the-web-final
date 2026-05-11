-- Keep dealer identity in profiles.role while dealer_status controls access.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping dealer profile role sync because public.profiles does not exist.';
    return;
  end if;

  update public.profiles
  set role = 'dealer'
  where dealer_status in ('pending', 'approved', 'rejected', 'suspended', 'revoked')
    and role <> 'dealer';
end;
$$;
