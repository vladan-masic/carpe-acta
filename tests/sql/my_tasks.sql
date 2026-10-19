-- Run as the database owner in a disposable database or reviewed staging project.
-- Everything, including synthetic identities, is rolled back. No existing users are used.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values('a1000000-0000-4000-8000-000000000001'),('b1000000-0000-4000-8000-000000000001');
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; end$$;
grant execute on function pg_temp.assert(boolean,text) to authenticated,anon;
set local role authenticated;
select set_config('request.jwt.claim.sub','b1000000-0000-4000-8000-000000000001',true);
insert into public.user_tasks(user_id,id,title,difficulty,urgency,importance,status,previous_status,rank)
values(auth.uid(),'b2000000-0000-4000-8000-000000000001','Private B',3,1,1,'next','next',0);
insert into public.user_subtasks(user_id,task_id,id,title,rank) values(auth.uid(),'b2000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001','Private step',0);
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
select pg_temp.assert((select count(*)=0 from public.user_tasks),'A cannot read B tasks');
select pg_temp.assert((select count(*)=0 from public.user_subtasks),'A cannot read B subtasks');
select pg_temp.assert((select count(*)=0 from public.task_collections),'A cannot read B revisions');
with changed as (update public.user_tasks set title='intrusion' where user_id='b1000000-0000-4000-8000-000000000001' returning *) select pg_temp.assert(count(*)=0,'A cannot update B') from changed;
with changed as (delete from public.user_tasks where user_id='b1000000-0000-4000-8000-000000000001' returning *) select pg_temp.assert(count(*)=0,'A cannot delete B') from changed;
with changed as (update public.user_subtasks set title='intrusion' where user_id='b1000000-0000-4000-8000-000000000001' returning *) select pg_temp.assert(count(*)=0,'A cannot update B subtask') from changed;
with changed as (delete from public.user_subtasks where user_id='b1000000-0000-4000-8000-000000000001' returning *) select pg_temp.assert(count(*)=0,'A cannot delete B subtask') from changed;
do $$begin
 begin perform public.read_tasks('b1000000-0000-4000-8000-000000000001'); raise exception 'Unauthorized RPC accepted'; exception when insufficient_privilege then null; end;
 begin perform public.write_tasks('b1000000-0000-4000-8000-000000000001',0,gen_random_uuid(),'[]'); raise exception 'Unauthorized write accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.user_tasks(user_id,id,title,difficulty,urgency,importance,status,previous_status,rank) values('b1000000-0000-4000-8000-000000000001',gen_random_uuid(),'intrusion',1,0,0,'next','next',0); raise exception 'Owner insert accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.user_subtasks(user_id,task_id,id,title,rank) values(auth.uid(),'b2000000-0000-4000-8000-000000000001',gen_random_uuid(),'intrusion',0); raise exception 'Foreign parent accepted'; exception when foreign_key_violation then null; end;
end$$;
-- Atomic initial save + retry with a stable mutation id.
create temporary table payload(data jsonb);
grant all on payload to authenticated;
insert into payload values(jsonb_build_array(jsonb_build_object('id','a2000000-0000-4000-8000-000000000001','ownerId',auth.uid(),'title','A task','notes','Notes','difficulty',4,'urgency',2,'importance',1,'deadline','2026-10-20','minutes',25,'status','doing','previousStatus','doing','rank',0,'completedAt',null,'createdAt',now(),'updatedAt',now(),'subtasks',jsonb_build_array(jsonb_build_object('id','a3000000-0000-4000-8000-000000000001','title','A step','rank',0,'completedAt',null)))));
select pg_temp.assert((public.write_tasks(auth.uid(),0,'a4000000-0000-4000-8000-000000000001',(select data from payload),array['a2000000-0000-4000-8000-000000000001'::uuid])->>'revision')::int=1,'first save');
select pg_temp.assert((public.write_tasks(auth.uid(),0,'a4000000-0000-4000-8000-000000000001',(select data from payload))->>'revision')::int=1,'idempotent retry');
select pg_temp.assert((select count(*)=1 from public.user_tasks),'no duplicate task');
select pg_temp.assert((select count(*)=1 from public.user_subtasks),'subtasks persisted');
do $$begin
 begin perform public.write_tasks(auth.uid(),0,gen_random_uuid(),(select data from payload)); raise exception 'Stale write accepted'; exception when sqlstate 'PT409' then null; end;
 begin update public.user_subtasks set task_id='b2000000-0000-4000-8000-000000000001'; raise exception 'Foreign parent update accepted'; exception when foreign_key_violation then null; end;
 begin update public.user_subtasks set user_id='b1000000-0000-4000-8000-000000000001',task_id='b2000000-0000-4000-8000-000000000001'; raise exception 'Owner update accepted'; exception when insufficient_privilege then null; end;
 begin update public.user_tasks set user_id='b1000000-0000-4000-8000-000000000001'; raise exception 'Task owner update accepted'; exception when insufficient_privilege then null; end;
 begin update public.user_tasks set difficulty=6; raise exception 'Invalid difficulty accepted'; exception when check_violation then null; end;
 begin update public.user_tasks set status='done'; raise exception 'Invalid completion accepted'; exception when check_violation then null; end;
 begin update public.user_tasks set title=' '; raise exception 'Empty title accepted'; exception when check_violation then null; end;
 begin update public.user_tasks set estimated_minutes=0; raise exception 'Invalid duration accepted'; exception when check_violation then null; end;
 begin perform public.write_tasks(auth.uid(),1,gen_random_uuid(),jsonb_set((select data from payload),'{0,difficulty}','6')); raise exception 'Invalid RPC accepted'; exception when check_violation then null; end;
end$$;
select pg_temp.assert((public.read_tasks(auth.uid())->>'revision')::int=1,'failed operations rolled back');
update payload set data=jsonb_set(jsonb_set(data,'{0,status}','"done"'),'{0,completedAt}',to_jsonb(now()));
select pg_temp.assert((public.write_tasks(auth.uid(),1,gen_random_uuid(),(select data from payload))->'tasks'->0->>'status')='done','complete');
update payload set data=jsonb_set(jsonb_set(data,'{0,status}','"doing"'),'{0,completedAt}','null');
select pg_temp.assert((public.write_tasks(auth.uid(),2,gen_random_uuid(),(select data from payload))->'tasks'->0->>'completedAt') is null,'reopen');
-- A direct table write must invalidate the previous collection revision too.
update public.user_tasks set title='Other client';
select pg_temp.assert((public.read_tasks(auth.uid())->>'revision')::int>3,'direct writes invalidate revision');
select public.write_tasks(auth.uid(),(public.read_tasks(auth.uid())->>'revision')::bigint,gen_random_uuid(),'[]');
select pg_temp.assert((select count(*)=0 from public.user_subtasks),'delete cascades');
select pg_temp.assert(jsonb_array_length(public.read_tasks(auth.uid())->'importedIds')=1,'import receipt survives delete');
select set_config('request.jwt.claim.sub','b1000000-0000-4000-8000-000000000001',true);
select pg_temp.assert((select title='Private B' from public.user_tasks),'B unchanged');
reset role;
set local role anon;
do $$begin
 begin perform * from public.user_tasks; raise exception 'Anonymous table access'; exception when insufficient_privilege then null; end;
 begin perform public.read_tasks(null); raise exception 'Anonymous RPC access'; exception when insufficient_privilege then null; end;
end$$;
reset role;
rollback;
\echo 'My Tasks SQL security and transaction checks passed (rolled back).'
