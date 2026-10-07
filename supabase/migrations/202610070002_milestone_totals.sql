begin;
-- A single lifetime aggregate replaces timestamp pagination in the browser.
-- SECURITY INVOKER retains completion-table RLS in addition to the owner check.
create function public.milestone_totals(p_owner uuid, p_timezone text, p_until timestamptz default now())
returns table(actions bigint, days bigint)
language plpgsql stable security invoker set search_path = '' as $$
begin
  if auth.uid() is null or p_owner is distinct from auth.uid() then
    raise exception 'Authenticated owner required';
  end if;
  if not exists(select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone';
  end if;
  return query select count(*), count(distinct (completed_at at time zone p_timezone)::date)
    from public.tip_completions
    where user_id = p_owner and completed_at <= least(coalesce(p_until, now()), now());
end $$;
revoke all on function public.milestone_totals(uuid,text,timestamptz) from public, anon;
grant execute on function public.milestone_totals(uuid,text,timestamptz) to authenticated;
commit;
