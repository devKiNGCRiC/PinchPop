-- Two follow-ups needed to sync localStorage runs to the cloud and show a real leaderboard.

-- 1. Re-point runs.user_id at public.profiles instead of auth.users directly. profiles.id already
--    references auth.users (on delete cascade), so identity integrity and cascade-on-account-
--    deletion are unchanged — this only lets PostgREST embed the player's username directly in a
--    leaderboard query (`select ..., profiles(username)`), which it can only do across an actual
--    foreign key between the two tables being joined.
alter table public.runs drop constraint if exists runs_user_id_fkey;
alter table public.runs
  add constraint runs_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade;

-- 2. Link a cloud run back to the localStorage memory it was synced from. This makes syncing
--    idempotent: the automatic sync on solve and the later "import my local runs" bulk import can
--    both attempt the same memory without ever creating a duplicate leaderboard row (the app
--    inserts and treats a unique-violation on this index as "already synced").
alter table public.runs add column local_id text;
create unique index runs_user_local_id_key on public.runs (user_id, local_id) where local_id is not null;
