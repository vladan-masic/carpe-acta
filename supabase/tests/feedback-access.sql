-- Run as postgres after the feedback migration. All test writes are rolled back.
begin;
do $$ begin
 if not exists(select 1 from auth.users) then raise exception 'Sign in first'; end if;
 if has_table_privilege('anon','public.completion_feedback','SELECT')
 or has_table_privilege('anon','public.completion_feedback','INSERT')
 or has_column_privilege('authenticated','public.completion_feedback','user_id','UPDATE')
 or has_column_privilege('authenticated','public.completion_feedback','completion_id','UPDATE')
 or has_table_privilege('authenticated','public.completion_feedback','DELETE') then
 raise exception 'Unexpected privileges'; end if;
end $$;
select set_config('request.jwt.claim.sub',(select id::text from auth.users limit 1),true);
select set_config('app.feedback_test',gen_random_uuid()::text,true);
set local role authenticated;
insert into public.tip_completions(user_id,id,tip_id,completed_at)
 values(auth.uid(),current_setting('app.feedback_test'),'feedback-test',now());
insert into public.completion_feedback(user_id,completion_id,helpful)
 values(auth.uid(),current_setting('app.feedback_test'),true) on conflict do nothing;
update public.completion_feedback set helpful=false
 where user_id=auth.uid() and completion_id=current_setting('app.feedback_test');
-- A repeated guest import must not overwrite the account's changed answer.
insert into public.completion_feedback(user_id,completion_id,helpful)
 values(auth.uid(),current_setting('app.feedback_test'),true) on conflict do nothing;
do $$ begin
 if (select count(*) from public.completion_feedback where completion_id=current_setting('app.feedback_test')) <> 1 then raise exception 'Owner access or idempotency failed'; end if;
 if (select helpful from public.completion_feedback where completion_id=current_setting('app.feedback_test')) is distinct from false then raise exception 'Answer change or import preservation failed'; end if;
 begin
 insert into public.completion_feedback(user_id,completion_id,helpful) values(auth.uid(),gen_random_uuid()::text,true);
 raise exception 'Orphan feedback allowed';
 exception when foreign_key_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ declare affected integer; begin
 if exists(select 1 from public.completion_feedback where completion_id=current_setting('app.feedback_test')) then raise exception 'Cross-account read allowed'; end if;
 update public.completion_feedback set helpful=true where completion_id=current_setting('app.feedback_test');
 get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Cross-account update allowed'; end if;
 begin
 insert into public.completion_feedback(user_id,completion_id,helpful) values(gen_random_uuid(),current_setting('app.feedback_test'),true);
 raise exception 'Cross-account insert allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: feedback isolation, parent linkage, answer changes, idempotency and privileges' as result;
