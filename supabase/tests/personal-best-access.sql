-- Local fixture test; all data changes roll back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from auth.users limit 1),true);
delete from public.tip_completions where user_id=auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at) values
(auth.uid(),'best-a','test','2025-12-29T12:00:00Z'),
(auth.uid(),'best-b','test','2026-01-04T12:00:00Z'),
(auth.uid(),'best-c','test','2026-01-05T12:00:00Z'),
(auth.uid(),'best-d','test','2026-01-06T12:00:00Z'),
(auth.uid(),'best-e','test','2026-01-06T13:00:00Z'),
(auth.uid(),'best-future','test',now()+interval '10 days');
set local role authenticated;
do $$ declare best record; begin
 select * into best from public.personal_best_week(auth.uid(),'Europe/Belgrade');
 if best.days <> 2 or best.week is distinct from '2025-12-29' then raise exception 'Tie, distinct day or week boundary failed'; end if;
 begin
  perform public.personal_best_week(gen_random_uuid(),'UTC');
  raise exception 'Cross-owner read allowed';
 exception when raise_exception then
  if sqlerrm <> 'Authenticated owner required' then raise; end if;
 end;
 begin
  perform public.personal_best_week(auth.uid(),'invalid');
  raise exception 'Invalid timezone allowed';
 exception when raise_exception then
  if sqlerrm <> 'Invalid timezone' then raise; end if;
 end;
end $$;
reset role;
delete from public.tip_completions where user_id=auth.uid() and id='best-b';
set local role authenticated;
do $$ declare best record; begin
 select * into best from public.personal_best_week(auth.uid(),'UTC');
 if best.days <> 2 or best.week is distinct from '2026-01-05' then raise exception 'Undo failed'; end if;
 select * into best from public.personal_best_week(auth.uid(),'UTC','2026-01-05T00:00:00Z');
 if best.days <> 1 then raise exception 'Cutoff failed'; end if;
end $$;
reset role;
delete from public.tip_completions where user_id=auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at) values
(auth.uid(),'midnight-a','test','2026-01-04T23:30:00Z'),
(auth.uid(),'midnight-b','test','2026-01-05T12:30:00Z');
set local role authenticated;
do $$ declare best record; begin
 select * into best from public.personal_best_week(auth.uid(),'Europe/Belgrade');
 if best.days <> 1 or best.week is distinct from '2026-01-05' then raise exception 'Local timezone failed'; end if;
 select * into best from public.personal_best_week(auth.uid(),'UTC');
 if best.days <> 1 or best.week is distinct from '2025-12-29' then raise exception 'UTC boundary failed'; end if;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ declare best record; begin
 select * into best from public.personal_best_week(auth.uid(),'UTC');
 if best.days <> 0 or best.week is not null then raise exception 'Empty history or owner isolation failed'; end if;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.personal_best_week(uuid,text,timestamptz)','EXECUTE') then raise exception 'Anonymous access allowed'; end if;
 if (select prosecdef from pg_proc where oid='public.personal_best_week(uuid,text,timestamptz)'::regprocedure) then raise exception 'RLS bypass'; end if;
end $$;
rollback;
select 'PASS: weekly best, ties, cutoff, Undo, timezone and owner isolation' as result;
