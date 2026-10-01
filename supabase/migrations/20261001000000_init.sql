-- PinchPop initial schema: accounts, cloud runs (replaces localStorage memories for signed-in
-- players), and a private photo bucket. Public/anon play still works entirely offline; this
-- schema only backs the optional "sign in to sync" path.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, holding the public display name.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 24)
);

alter table public.profiles enable row level security;

-- "Automatically expose new tables" is off (by design — see project setup), so every new public
-- table needs its Data API grants spelled out explicitly; RLS policies alone don't reach a table
-- the API role has no privilege on at all.
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

create policy "Profiles are publicly readable (leaderboard display names)"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Auto-create a profile row on signup. Prefers the username passed as signup metadata
-- (supabase.auth.signUp({ options: { data: { username } } })); falls back to one derived from
-- the email so the app never has a signed-in user with no profile. Runs as the table owner
-- (security definer) because auth.users triggers fire before the new user's own RLS context
-- exists.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  chosen text := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  fallback text :=
    -- Truncated to 15 chars so the longest possible result (15 + "_" + 6) never exceeds the
    -- username_length check below, regardless of how long the email's local part is.
    left(coalesce(nullif(split_part(new.email, '@', 1), ''), 'player'), 15)
      || '_' || substr(new.id::text, 1, 6);
begin
  -- A requested username outside the allowed length never reaches the insert below, so it can't
  -- block signup with a constraint error.
  if chosen is not null and char_length(chosen) not between 3 and 24 then
    chosen := null;
  end if;

  begin
    insert into public.profiles (id, username) values (new.id, coalesce(chosen, fallback));
  exception when unique_violation then
    -- The requested username was already taken by someone else: fall back to a generated one,
    -- which is guaranteed unique since it embeds this user's own id. This never touches the
    -- other user's row.
    insert into public.profiles (id, username) values (new.id, fallback);
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- runs: one row per solved puzzle, cloud equivalent of the local Memory type
-- (src/lib/memories.ts). photo_path points into the private "photos" Storage bucket.
-- ---------------------------------------------------------------------------
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  art_id text not null,
  moves integer not null check (moves >= 0),
  seconds integer not null check (seconds >= 0),
  score integer not null check (score >= 0),
  accuracy real check (accuracy >= 0 and accuracy <= 1),
  photo_path text,
  aspect real,
  created_at timestamptz not null default now()
);

create index runs_user_id_idx on public.runs (user_id);
create index runs_score_idx on public.runs (score desc);

alter table public.runs enable row level security;

grant select on public.runs to anon, authenticated;
grant insert, delete on public.runs to authenticated;

-- Scores are meant to be public (it's a leaderboard); photos stay private at the Storage layer
-- below, so a public photo_path string alone can't be turned into a viewable image by anyone
-- but its owner.
create policy "Runs are publicly readable (leaderboard)"
  on public.runs for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own runs"
  on public.runs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own runs"
  on public.runs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Storage: a private bucket for camera photos, one folder per user ({user_id}/{run_id}.jpg).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false);

create policy "Users can upload to their own photo folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can read their own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
