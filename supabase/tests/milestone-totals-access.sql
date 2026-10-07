-- Run as postgres after the migration. All fixtures are rolled back.
begin;
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
select set_config('app.test_owner', current_setting('request.jwt.claim.sub'), true);
delete from public.tip_completions where user_id = auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at)
select auth.uid(), 'milestone-test-' || n || '-' || repeat, 'test', now() - n * interval '1 day'
from generate_series(0,599) n cross join generate_series(1,2) repeat;
insert into public.tip_completions(user_id,id,tip_id,completed_at)
values(auth.uid(),'milestone-future','test',now() + interval '1 day');
set local role authenticated;
do $$ declare totals record; begin
  select * into totals from public.milestone_totals(auth.uid(),'Europe/Belgrade');
  if totals.actions <> 1200 or totals.days <> 600 then raise exception 'Uncapped counts or future exclusion failed'; end if;
  begin
    perform public.milestone_totals(gen_random_uuid(),'UTC');
    raise exception 'Cross-owner access allowed';
  exception when raise_exception then
    if sqlerrm <> 'Authenticated owner required' then raise; end if;
  end;
end $$;
reset role;
delete from public.tip_completions where user_id = auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at) values
(auth.uid(),'midnight-a','test','2026-01-01T23:30:00Z'),
(auth.uid(),'midnight-b','test','2026-01-02T00:30:00Z');
set local role authenticated;
do $$ declare totals record; begin
  select * into totals from public.milestone_totals(auth.uid(),'Europe/Belgrade');
  if totals.actions <> 2 or totals.days <> 1 then raise exception 'Local date grouping failed'; end if;
  select * into totals from public.milestone_totals(auth.uid(),'UTC');
  if totals.days <> 2 then raise exception 'UTC grouping failed'; end if;
  select * into totals from public.milestone_totals(auth.uid(),'UTC','2026-01-01T23:45:00Z');
  if totals.actions <> 1 then raise exception 'Cutoff failed'; end if;
end $$;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
do $$ declare totals record; begin
  select * into totals from public.milestone_totals(auth.uid(),'UTC');
  if totals.actions <> 0 or totals.days <> 0 then raise exception 'RLS isolation failed'; end if;
end $$;
reset role;
do $$ begin
  if has_function_privilege('anon','public.milestone_totals(uuid,text,timestamptz)','EXECUTE') then raise exception 'Anonymous execution granted'; end if;
  if (select prosecdef from pg_proc where oid='public.milestone_totals(uuid,text,timestamptz)'::regprocedure) then raise exception 'Function bypasses RLS'; end if;
end $$;
rollback;
select 'PASS: uncapped totals, timezone grouping, cutoff, future exclusion and owner isolation' as result;
