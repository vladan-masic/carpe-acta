begin;
-- The existing composite foreign key deletes this event's feedback atomically.
-- Deletion is scoped to the authenticated owner; no update grants are added.
grant delete on public.tip_completions to authenticated;
create policy "Delete own completions" on public.tip_completions
  for delete to authenticated using ((select auth.uid()) = user_id);
commit;
