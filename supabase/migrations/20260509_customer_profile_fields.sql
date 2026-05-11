do $migration$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping customer profile fields because public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    add column if not exists phone text;

  alter table public.profiles
    add column if not exists address text;
end;
$migration$;
