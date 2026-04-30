-- Harden RLS: prevent client-side onboarding bypass via direct profile inserts.

drop policy if exists profiles_insert_own on public.profiles;

create policy "profiles_insert_own"
on public.profiles
for insert
with check (
  auth.uid() = id
  -- Role spoofing protection: client inserts must always start as 'user'.
  and role = 'user'
  -- Step-based onboarding protection: new signups can only start at step 0 or 1.
  and onboarding_step >= 0
  and onboarding_step <= 1
  -- Completion must be false until the server explicitly moves step progression.
  and onboarding_completed = false
);

