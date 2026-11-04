\set ON_ERROR_STOP on
begin;
create function pg_temp.assert(ok boolean,message text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'Assertion failed: %',message; end if; end$$;
insert into auth.users(id) values('a1000000-0000-4000-8000-000000000001'),('b1000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
create temporary table focus_payload(data jsonb);
grant all on focus_payload to authenticated;
insert into focus_payload values(jsonb_build_object('user_id',auth.uid(),'id','a2000000-0000-4000-8000-000000000001','session_id','a2000000-0000-4000-8000-000000000001','task_id','a3000000-0000-4000-8000-000000000001','subtask_id',null,'started_at','2026-11-04T10:00:00Z','ended_at','2026-11-04T10:05:00Z','focused_seconds',120,'chosen_minutes',5,'outcome','progress','created_at',now()));
select pg_temp.assert((public.record_focus_session((select data from focus_payload))->>'focused_seconds')::int=120,'own save');
select public.record_focus_session((select jsonb_set(data,'{focused_seconds}','60') from focus_payload));
select pg_temp.assert((select count(*)=1 and max(focused_seconds)=120 from public.focus_history),'retry cannot duplicate or overwrite');
select pg_temp.assert((select count(*)=0 from public.user_tasks),'history never creates tasks or completions');
select pg_temp.assert((select count(*)=1 from public.focus_history_receipts),'receipt atomic');
do $$begin
 begin update public.focus_history set focused_seconds=1; raise exception 'Update accepted'; exception when insufficient_privilege then null; end;
 begin delete from public.focus_history_receipts; raise exception 'Receipt deletion accepted'; exception when insufficient_privilege then null; end;
 begin perform public.record_focus_session(jsonb_set((select data from focus_payload),'{user_id}','"b1000000-0000-4000-8000-000000000001"')); raise exception 'Foreign owner accepted'; exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub','b1000000-0000-4000-8000-000000000001',true);
select pg_temp.assert((select count(*)=0 from public.focus_history),'B cannot read A');
select pg_temp.assert((select count(*)=0 from public.focus_history_receipts),'B cannot read A receipts');
with removed as (delete from public.focus_history returning *) select pg_temp.assert(count(*)=0,'B cannot delete A') from removed;
do $$begin
 begin insert into public.focus_history_receipts values('a1000000-0000-4000-8000-000000000001',gen_random_uuid()); raise exception 'Foreign receipt accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.focus_history select 'a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001',gen_random_uuid(),null,null,now(),60,2,null,now(); raise exception 'Foreign insert accepted'; exception when insufficient_privilege then null; end;
end$$;
-- Same session UUID is private to each owner.
select public.record_focus_session(jsonb_set((select data from focus_payload),'{user_id}',to_jsonb(auth.uid())));
select pg_temp.assert((select count(*)=1 from public.focus_history),'B own save');
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
-- Invalid data rolls back the receipt too; a corrected retry can succeed.
update focus_payload set data=jsonb_set(jsonb_set(data,'{id}','"a2000000-0000-4000-8000-000000000002"'),'{session_id}','"a2000000-0000-4000-8000-000000000002"');
do $$declare value integer; begin
 foreach value in array array[0,-1,43201] loop
  begin perform public.record_focus_session(jsonb_set((select data from focus_payload),'{focused_seconds}',to_jsonb(value))); raise exception 'Invalid duration accepted'; exception when check_violation then null; end;
 end loop;
 begin perform public.record_focus_session(jsonb_set((select data from focus_payload),'{started_at}','"infinity"')); raise exception 'Infinite time accepted'; exception when check_violation then null; end;
 begin perform public.record_focus_session(jsonb_set((select data from focus_payload),'{outcome}','"score"')); raise exception 'Invalid outcome accepted'; exception when check_violation then null; end;
end$$;
select pg_temp.assert((select count(*)=1 from public.focus_history_receipts),'failed save leaves no receipt');
select public.record_focus_session((select data from focus_payload));
delete from public.focus_history where session_id='a2000000-0000-4000-8000-000000000002';
select pg_temp.assert(public.record_focus_session((select data from focus_payload)) is null,'retry cannot resurrect deletion');
select pg_temp.assert((select count(*)=1 from public.focus_history),'deleted entry stays deleted');
select pg_temp.assert((select count(*)=2 from public.focus_history_receipts),'delete retains minimal receipt');
-- Parent deletion cannot cascade into history (stable references, intentionally no task FK).
insert into public.user_tasks(user_id,id,title,difficulty,urgency,importance,status,previous_status,rank) values(auth.uid(),'a3000000-0000-4000-8000-000000000001','Disposable task',1,0,0,'next','next',0);
delete from public.user_tasks;
select pg_temp.assert((select count(*)=1 from public.focus_history),'parent deletion retains history');
reset role;
set local role anon;
do $$begin
 begin perform * from public.focus_history; raise exception 'Anonymous read'; exception when insufficient_privilege then null; end;
 begin perform public.record_focus_session('{}'); raise exception 'Anonymous RPC'; exception when insufficient_privilege then null; end;
end$$;
reset role;
rollback;
\echo 'Focus history RLS, constraints, idempotency, deletion and isolation passed (rolled back).'
