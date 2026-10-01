begin;
create table public.tip_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) > 0),
  tip_id text not null check (length(tip_id) > 0),
  completed_at timestamptz not null,
  primary key (user_id, id)
);
alter table public.tip_completions enable row level security;
revoke all on public.tip_completions from anon, authenticated;
grant select, insert on public.tip_completions to authenticated;
create policy "Read own completions" on public.tip_completions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save own completions" on public.tip_completions
  for insert to authenticated with check ((select auth.uid()) = user_id);
commit;
