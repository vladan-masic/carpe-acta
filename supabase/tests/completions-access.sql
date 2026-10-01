-- Run as postgres in SQL Editor after the migration. No test data is retained.
begin;
do $$ begin
  if not exists (select 1 from auth.users) then raise exception 'Sign in first'; end if;
  if has_table_privilege('anon','public.tip_completions','SELECT')
    or has_table_privilege('anon','public.tip_completions','INSERT')
    or has_table_privilege('authenticated','public.tip_completions','UPDATE')
    or has_table_privilege('authenticated','public.tip_completions','DELETE') then
    raise exception 'Unexpected privileges';
  end if;
end $$;
select set_config('request.jwt.claim.sub',(select id::text from auth.users limit 1),true);
select set_config('app.test_completion',gen_random_uuid()::text,true);
set local role authenticated;
insert into public.tip_completions(user_id,id,tip_id,completed_at)
 values(auth.uid(),current_setting('app.test_completion'),'test-tip','2026-09-16T10:00:00Z');
insert into public.tip_completions(user_id,id,tip_id,completed_at)
 values(auth.uid(),current_setting('app.test_completion'),'test-tip',now()) on conflict do nothing;
do $$ begin
 if (select count(*) from public.tip_completions where id=current_setting('app.test_completion')) <> 1
   then raise exception 'Duplicate prevention or owner read failed'; end if;
 if (select completed_at from public.tip_completions where id=current_setting('app.test_completion')) <> '2026-09-16T10:00:00Z'::timestamptz
   then raise exception 'Original timestamp was overwritten'; end if;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ begin
 if exists(select 1 from public.tip_completions where id=current_setting('app.test_completion'))
   then raise exception 'Cross-account read allowed'; end if;
 begin
   insert into public.tip_completions(user_id,id,tip_id,completed_at)
    values(gen_random_uuid(),gen_random_uuid()::text,'test-tip',now());
   raise exception 'Cross-account insert allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
select 'PASS: completion owner access, isolation, idempotency, timestamp preservation and privileges' as result;
