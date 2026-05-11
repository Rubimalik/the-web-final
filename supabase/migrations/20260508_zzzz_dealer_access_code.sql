-- Optional dealer access code field for admin-managed dealer records.

do $migration$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping dealer access code migration because public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    add column if not exists dealer_access_code text;
end;
$migration$;
