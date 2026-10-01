begin;
create table public.completion_feedback (
  user_id uuid not null,
  completion_id text not null,
  helpful boolean not null,
  primary key (user_id, completion_id),
  foreign key (user_id, completion_id) references public.tip_completions(user_id, id) on delete cascade
);
alter table public.completion_feedback enable row level security;
revoke all on public.completion_feedback from anon, authenticated;
grant select, insert on public.completion_feedback to authenticated;
grant update (helpful) on public.completion_feedback to authenticated;
create policy "Read own feedback" on public.completion_feedback
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save own feedback" on public.completion_feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Change own feedback" on public.completion_feedback
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
