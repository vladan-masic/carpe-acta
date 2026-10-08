begin;
-- Return one lifetime summary, retaining the completion table's RLS.
create function public.personal_best_week(p_owner uuid, p_timezone text, p_until timestamptz default now())
returns table(days bigint, week text)
language plpgsql stable security invoker set search_path = '' as $$
begin
  if auth.uid() is null or p_owner is distinct from auth.uid() then
    raise exception 'Authenticated owner required';
  end if;
  if not exists(select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone';
  end if;
  return query
    with weekly as (
      select date_trunc('week', completed_at at time zone p_timezone)::date as monday,
        count(distinct (completed_at at time zone p_timezone)::date) as active_days
      from public.tip_completions
      where user_id = p_owner and completed_at <= least(coalesce(p_until, now()), now())
      group by 1
    ), best as (
      select active_days, monday from weekly order by active_days desc, monday asc limit 1
    )
    select coalesce((select active_days from best),0),
      (select to_char(monday,'YYYY-MM-DD') from best);
end $$;
revoke all on function public.personal_best_week(uuid,text,timestamptz) from public, anon;
grant execute on function public.personal_best_week(uuid,text,timestamptz) to authenticated;
commit;
