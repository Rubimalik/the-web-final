-- Allow future dealer profiles while keeping code-based dealer access separate.
-- This is guarded so local product-only databases without public.profiles do not fail.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'Skipping dealer profile migration because public.profiles does not exist.';
    return;
  end if;

  alter table public.profiles
    alter column role set default 'user';

  alter table public.profiles
    drop constraint if exists profiles_role_check;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'dealer', 'admin'));

  alter table public.profiles
    add column if not exists dealer_status text not null default 'pending';

  alter table public.profiles
    add column if not exists company_name text;

  alter table public.profiles
    add column if not exists approved_at timestamptz;

  alter table public.profiles
    drop constraint if exists profiles_dealer_status_check;

  alter table public.profiles
    add constraint profiles_dealer_status_check
    check (dealer_status in ('pending', 'approved', 'rejected', 'suspended'));

  execute $function$
    create or replace function public.enforce_profile_sensitive_field_updates()
    returns trigger
    language plpgsql
    as $body$
    begin
      if auth.role() <> 'service_role' then
        if (new.role is distinct from old.role) then
          raise exception 'Role changes are not allowed via client-side requests.';
        end if;

        if (new.onboarding_step is distinct from old.onboarding_step)
          or (new.onboarding_completed is distinct from old.onboarding_completed) then
          raise exception 'Onboarding updates are not allowed via client-side requests.';
        end if;

        if (new.dealer_status is distinct from old.dealer_status)
          or (new.approved_at is distinct from old.approved_at) then
          raise exception 'Dealer approval changes are not allowed via client-side requests.';
        end if;
      end if;

      return new;
    end;
    $body$;
  $function$;
end;
$$;
