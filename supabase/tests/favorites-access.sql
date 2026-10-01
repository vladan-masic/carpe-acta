-- Run after the migration in SQL Editor as postgres. Uses an existing auth user
-- and a unique temporary tip ID; all data and settings are rolled back.
begin;
do $$ begin
  if not exists (select 1 from auth.users) then
    raise exception 'Sign in once before running this check';
  end if;
  if has_table_privilege('anon', 'public.tip_favorites', 'SELECT')
    or has_table_privilege('anon', 'public.tip_favorites', 'INSERT')
    or has_table_privilege('anon', 'public.tip_favorites', 'DELETE')
    or has_table_privilege('authenticated', 'public.tip_favorites', 'UPDATE') then
    raise exception 'Unexpected table privileges';
  end if;
end $$;
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
select set_config('app.test_tip', 'access-check-' || gen_random_uuid()::text, true);
set local role authenticated;
insert into public.tip_favorites(user_id, tip_id)
  values (auth.uid(), current_setting('app.test_tip'));
insert into public.tip_favorites(user_id, tip_id)
  values (auth.uid(), current_setting('app.test_tip')) on conflict do nothing;
do $$ begin
  if (select count(*) from public.tip_favorites where tip_id = current_setting('app.test_tip')) <> 1 then
    raise exception 'Owner read or duplicate prevention failed';
  end if;
end $$;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
do $$ declare affected integer; begin
  if exists (select 1 from public.tip_favorites where tip_id = current_setting('app.test_tip')) then
    raise exception 'Another account can read the row';
  end if;
  delete from public.tip_favorites where tip_id = current_setting('app.test_tip');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another account can delete the row'; end if;
  begin
    insert into public.tip_favorites(user_id, tip_id)
      values (gen_random_uuid(), current_setting('app.test_tip'));
    raise exception 'Cross-account insert was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
set local role authenticated;
do $$ declare affected integer; begin
  delete from public.tip_favorites where tip_id = current_setting('app.test_tip');
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner delete failed'; end if;
end $$;
rollback;
select 'PASS: owner access, isolation, duplicate prevention, and privileges' as result;
