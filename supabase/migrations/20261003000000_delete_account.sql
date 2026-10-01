-- Lets a signed-in player delete their own account. Supabase's official way to remove a user
-- (auth.admin.deleteUser()) needs a service-role key, which a client-only app never has — this
-- does the same underlying thing (delete the auth.users row, which Supabase's own docs confirm
-- is the correct way to remove an account) via a security-definer function instead, scoped so a
-- caller can only ever delete their own row (there is no argument to pass another user's id).
--
-- Deleting the row cascades to public.profiles, then public.runs (both already `on delete
-- cascade` from earlier migrations) and to auth.sessions, invalidating the player's session.
-- Per Supabase's docs, a user cannot be deleted while they still own Storage objects — the app
-- must delete the player's photos from the "photos" bucket before calling this function.
create function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from auth.users where id = (select auth.uid());
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
