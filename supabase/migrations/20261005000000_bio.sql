-- A short public bio per player, shown on their own Account/Passport and on their public player
-- page (linked from the worldwide leaderboard). Already covered by the existing `profiles`
-- grants/policies from the init migration (table-level grants apply to every column, and the
-- public-read / owner-update policies already cover this one too) — no new SQL needed there.
alter table public.profiles
  add column bio text,
  add constraint bio_length check (bio is null or char_length(bio) <= 160);
