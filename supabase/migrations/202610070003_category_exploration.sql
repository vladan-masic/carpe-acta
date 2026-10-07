begin;
-- Return distinct known catalog IDs, never the full completion history.
create function public.completed_catalog_tip_ids(p_owner uuid, p_tip_ids text[], p_until timestamptz default now())
returns setof text language plpgsql stable security invoker set search_path = '' as $$
begin
  if auth.uid() is null or p_owner is distinct from auth.uid() then
    raise exception 'Authenticated owner required';
  end if;
  return query select distinct tip_id from public.tip_completions
    where user_id = p_owner and tip_id = any(p_tip_ids)
      and completed_at <= least(coalesce(p_until, now()), now())
    order by tip_id;
end $$;
revoke all on function public.completed_catalog_tip_ids(uuid,text[],timestamptz) from public, anon;
grant execute on function public.completed_catalog_tip_ids(uuid,text[],timestamptz) to authenticated;
commit;
