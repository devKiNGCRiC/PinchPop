-- A public avatar per player, shown on the Passport and the worldwide leaderboard. Unlike
-- "photos" (private, per-user), this bucket is public: a "Public" bucket only bypasses access
-- control for reads via the asset's URL (so the app can build avatar URLs with plain string
-- interpolation, no auth needed) — uploads, replaces and deletes still need the explicit RLS
-- policies below, same as any other bucket.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Needed alongside insert so upsert (replacing an existing avatar) works, per Supabase's storage
-- docs: upsert requires select + update in addition to insert.
create policy "Users can read their own avatar via the authenticated API"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can remove their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Where to find a profile's avatar, if it has one. Stored as the storage object path (e.g.
-- "<user_id>/avatar.jpg"), not a full URL, so it keeps working even if the project's URL ever
-- changes — the app builds the public URL from this path at read time. Already covered by the
-- existing `profiles` grants/policies from the init migration (table-level grants apply to every
-- column, and the existing "Users can update their own profile" policy covers this one too).
alter table public.profiles add column avatar_path text;
