-- Run as postgres after 202610040001_completion_undo.sql. All writes roll back.
begin;
do $$ begin
 if not exists(select 1 from auth.users) then raise exception 'Sign in first'; end if;
 if has_table_privilege('anon','public.tip_completions','DELETE')
 or not has_table_privilege('authenticated','public.tip_completions','DELETE')
 or has_table_privilege('authenticated','public.tip_completions','UPDATE')
 or has_table_privilege('authenticated','public.completion_feedback','DELETE') then
 raise exception 'Unexpected privileges'; end if;
end $$;
select set_config('app.undo_owner',(select id::text from auth.users limit 1),true);
select set_config('request.jwt.claim.sub',current_setting('app.undo_owner'),true);
select set_config('app.undo_event',gen_random_uuid()::text,true);
select set_config('app.undo_other',gen_random_uuid()::text,true);
set local role authenticated;
insert into public.tip_completions(user_id,id,tip_id,completed_at) values
 (auth.uid(),current_setting('app.undo_event'),'undo-test',now()),
 (auth.uid(),current_setting('app.undo_other'),'undo-test',now());
insert into public.completion_feedback(user_id,completion_id,helpful)
 values(auth.uid(),current_setting('app.undo_event'),true);
-- Another account cannot delete the event, even knowing the exact owner and ID.
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ declare affected integer; begin
 delete from public.tip_completions where user_id=current_setting('app.undo_owner')::uuid and id=current_setting('app.undo_event');
 get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Cross-account delete allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('app.undo_owner'),true);
do $$ begin
 if not exists(select 1 from public.tip_completions where id=current_setting('app.undo_event')) then raise exception 'Other account removed owner event'; end if;
end $$;
delete from public.tip_completions where user_id=auth.uid() and id=current_setting('app.undo_event');
-- A retry after an uncertain response is idempotent.
delete from public.tip_completions where user_id=auth.uid() and id=current_setting('app.undo_event');
do $$ begin
 if exists(select 1 from public.tip_completions where id=current_setting('app.undo_event')) then raise exception 'Owner delete failed'; end if;
 if exists(select 1 from public.completion_feedback where completion_id=current_setting('app.undo_event')) then raise exception 'Feedback cascade failed'; end if;
 if not exists(select 1 from public.tip_completions where id=current_setting('app.undo_other')) then raise exception 'Unrelated completion removed'; end if;
 -- A feedback write arriving after undo cannot recreate the parent event.
 begin
 insert into public.completion_feedback(user_id,completion_id,helpful) values(auth.uid(),current_setting('app.undo_event'),false);
 raise exception 'Late feedback recreated removed event';
 exception when foreign_key_violation then null; end;
end $$;
rollback;
select 'PASS: owner-only undo, feedback cascade, event isolation, retries and late feedback' as result;
