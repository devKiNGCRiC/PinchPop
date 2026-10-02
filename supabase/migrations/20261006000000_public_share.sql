-- Lets a player opt one specific run into public visibility — an explicit, per-run, off-by-default
-- choice, never a bulk/account-level setting. `runs` rows are already fully public (the worldwide
-- leaderboard reads every row regardless), so this column doesn't gate the score/moves/time at
-- all — it only ever gates the one thing that was still private: the photo itself.
alter table public.runs add column is_public boolean not null default false;

-- The storage policies from the init migration already let the owner read their own photos; this
-- adds a second, independent SELECT policy (RLS policies are OR'd together) so anyone can also
-- read a photo whose owning run has been explicitly made public. A photo with is_public = false
-- (the default) is unaffected — only the owner-scoped policy ever matches it.
create index runs_photo_path_idx on public.runs (photo_path) where photo_path is not null;

create policy "Public photos are viewable by everyone when their run is public"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'photos'
    and exists (
      select 1 from public.runs
      where runs.photo_path = storage.objects.name
        and runs.is_public = true
    )
  );
