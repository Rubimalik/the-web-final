DO $migration$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE NOTICE 'Skipping customer profile fields because public.profiles does not exist.';
    RETURN;
  END IF;

  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone TEXT;

  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS address TEXT;
END;
$migration$;
