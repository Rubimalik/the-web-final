-- Keep revoked dealer rows visible for admin review/history.

do $migration$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping dealer revoked status migration because public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    drop constraint if exists profiles_dealer_status_check;

  alter table public.profiles
    add constraint profiles_dealer_status_check
    check (dealer_status in ('none', 'pending', 'approved', 'rejected', 'suspended', 'revoked'));
end;
$migration$;
