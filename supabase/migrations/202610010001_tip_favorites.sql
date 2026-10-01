begin;
create table public.tip_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tip_id text not null check (length(trim(tip_id)) between 1 and 200),
  created_at timestamptz not null default now(),
  primary key (user_id, tip_id)
);
alter table public.tip_favorites enable row level security;
revoke all on public.tip_favorites from anon, authenticated;
grant select, insert, delete on public.tip_favorites to authenticated;
create policy "Read own favorites" on public.tip_favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save own favorites" on public.tip_favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Remove own favorites" on public.tip_favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
commit;
