-- Run as postgres after the migration; the transaction rolls back every change.
begin;
do $$ begin
  if not exists(select 1 from auth.users) then raise exception 'Sign in first'; end if;
  if has_table_privilege('anon', 'public.weekly_achievements', 'SELECT')
    or has_table_privilege('authenticated', 'public.weekly_achievements', 'INSERT')
    or has_table_privilege('authenticated', 'public.weekly_achievements', 'UPDATE')
    or has_table_privilege('authenticated', 'public.weekly_achievements', 'DELETE')
    or has_function_privilege('anon', 'public.sync_weekly_achievement(text)', 'EXECUTE') then
    raise exception 'Unexpected privileges';
  end if;
end $$;
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
select set_config('app.test_owner', current_setting('request.jwt.claim.sub'), true);
-- Isolate this user's current week inside the rollback transaction.
delete from public.weekly_achievements where user_id = auth.uid();
delete from public.tip_completions where user_id = auth.uid();
update auth.users set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{weekly_goal_days}', '1') where id = auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at) values(auth.uid(),'weekly-achievement-test','test',now());
set local role authenticated;
select public.sync_weekly_achievement('Europe/Belgrade');
select public.sync_weekly_achievement('Europe/Belgrade');
do $$ begin
  if (select count(*) from public.weekly_achievements) <> 1 then raise exception 'Idempotency failed'; end if;
  if (select target_days from public.weekly_achievements) <> 1 then raise exception 'Wrong target'; end if;
end $$;
reset role;
update auth.users set raw_user_meta_data = jsonb_set(raw_user_meta_data, '{weekly_goal_days}', '7') where id = auth.uid();
set local role authenticated;
select public.sync_weekly_achievement('Europe/Belgrade');
do $$ begin
  if (select target_days from public.weekly_achievements) <> 1 then raise exception 'Goal change rewrote achievement'; end if;
end $$;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
do $$ begin
  if exists(select 1 from public.weekly_achievements) then raise exception 'Cross-account read allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub', current_setting('app.test_owner'), true);
-- Undo removes the current week's award if its original target is no longer met.
delete from public.tip_completions where user_id = auth.uid() and id = 'weekly-achievement-test';
select public.sync_weekly_achievement('Europe/Belgrade');
do $$ begin
  if exists(select 1 from public.weekly_achievements) then raise exception 'Undo did not revoke current award'; end if;
end $$;
reset role;
insert into public.weekly_achievements(user_id, week_start, target_days, timezone)
values(auth.uid(), date_trunc('week', now() at time zone 'Europe/Belgrade')::date - 7, 3, 'Europe/Belgrade');
set local role authenticated;
select public.sync_weekly_achievement('Europe/Belgrade');
do $$ begin
  if (select count(*) from public.weekly_achievements) <> 1 then raise exception 'Past achievement lost'; end if;
  begin
    perform public.sync_weekly_achievement('invalid/zone');
    raise exception 'Bad timezone accepted';
  exception when raise_exception then
    if sqlerrm <> 'Invalid timezone' then raise; end if;
  end;
end $$;
rollback;
select 'PASS: weekly achievement isolation, idempotency, frozen targets, Undo and privileges' as result;
