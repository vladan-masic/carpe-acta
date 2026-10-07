begin;
create table public.weekly_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  target_days smallint not null check (target_days between 1 and 7),
  timezone text not null,
  achieved_at timestamptz not null default now(),
  primary key (user_id, week_start)
);
alter table public.weekly_achievements enable row level security;
revoke all on public.weekly_achievements from anon, authenticated;
grant select on public.weekly_achievements to authenticated;
create policy "Read own weekly achievements" on public.weekly_achievements
  for select to authenticated using ((select auth.uid()) = user_id);

-- Only this function writes snapshots. Targets and counts come from the server,
-- never a caller-supplied achievement. Lock per user to serialize device races.
create function public.sync_weekly_achievement(p_timezone text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  owner uuid := auth.uid();
  week date;
  goal integer := 0;
  active_days integer;
  saved public.weekly_achievements%rowtype;
  zone text := p_timezone;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text, 0));
  week := date_trunc('week', now() at time zone zone)::date;
  select * into saved from public.weekly_achievements where user_id = owner and week_start = week;
  if saved.user_id is not null then
    goal := saved.target_days;
    zone := saved.timezone;
  else
    select case when raw_user_meta_data->>'weekly_goal_days' ~ '^[1-7]$'
      then (raw_user_meta_data->>'weekly_goal_days')::integer else 0 end into goal
      from auth.users where id = owner;
  end if;
  if coalesce(goal, 0) = 0 then return; end if;
  select count(distinct (completed_at at time zone zone)::date) into active_days
    from public.tip_completions where user_id = owner
      and completed_at >= (week::timestamp at time zone zone)
      and completed_at < ((week + 7)::timestamp at time zone zone)
      and completed_at <= now();
  if saved.user_id is not null then
    if active_days < goal then
      delete from public.weekly_achievements where user_id = owner and week_start = week;
    end if;
  elsif active_days >= goal then
    insert into public.weekly_achievements(user_id, week_start, target_days, timezone)
      values(owner, week, goal, zone) on conflict do nothing;
  end if;
end $$;
revoke all on function public.sync_weekly_achievement(text) from public, anon;
grant execute on function public.sync_weekly_achievement(text) to authenticated;
commit;
