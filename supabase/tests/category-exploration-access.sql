-- Local fixtures only; the transaction restores all data.
begin;
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
delete from public.tip_completions where user_id = auth.uid();
insert into public.tip_completions(user_id,id,tip_id,completed_at) values
(auth.uid(),'exploration-1','known',now()-interval '1 day'),
(auth.uid(),'exploration-2','known',now()-interval '1 day'),
(auth.uid(),'exploration-3','retired',now()-interval '1 day'),
(auth.uid(),'exploration-4','future',now()+interval '1 day');
set local role authenticated;
do $$ begin
 if (select array_agg(id) from public.completed_catalog_tip_ids(auth.uid(),array['known','future']) id) is distinct from array['known'] then
   raise exception 'Distinct IDs or future exclusion failed';
 end if;
 if exists(select from public.completed_catalog_tip_ids(auth.uid(),array['known'],now()-interval '2 days')) then raise exception 'Cutoff failed'; end if;
 begin
   perform public.completed_catalog_tip_ids(gen_random_uuid(),array['known']);
   raise exception 'Cross-owner access allowed';
 exception when raise_exception then
   if sqlerrm <> 'Authenticated owner required' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ begin
 if exists(select from public.completed_catalog_tip_ids(auth.uid(),array['known'])) then raise exception 'Owner isolation failed'; end if;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.completed_catalog_tip_ids(uuid,text[],timestamptz)','EXECUTE') then raise exception 'Anonymous access allowed'; end if;
 if (select prosecdef from pg_proc where oid='public.completed_catalog_tip_ids(uuid,text[],timestamptz)'::regprocedure) then raise exception 'RLS bypass'; end if;
end $$;
rollback;
select 'PASS: distinct known tips, cutoff, future exclusion and owner isolation' as result;
