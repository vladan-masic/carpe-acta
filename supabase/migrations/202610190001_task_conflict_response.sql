begin;
-- Application version conflicts must not use PostgreSQL serialization_failure.
-- PostgREST retries 40001; PT409 returns an explicit, non-retryable HTTP 409.
create or replace function public.write_tasks(p_owner uuid, p_expected bigint, p_mutation uuid, p_tasks jsonb, p_import_ids uuid[] default '{}') returns jsonb
language plpgsql security invoker set search_path = public, pg_temp as $$
declare current_row public.task_collections; t jsonb; s jsonb; v_task_id uuid;
begin
  if auth.uid() is null or auth.uid() is distinct from p_owner then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_mutation is null or p_expected is null or jsonb_typeof(p_tasks) is distinct from 'array' or jsonb_array_length(p_tasks)>1000 or p_import_ids is null then
    raise exception 'Invalid task collection' using errcode='22023';
  end if;
  insert into public.task_collections(user_id) values(p_owner) on conflict do nothing;
  select * into current_row from public.task_collections where user_id=p_owner for update;
  if current_row.mutation_id=p_mutation then return public.read_tasks(p_owner); end if;
  if current_row.revision<>p_expected then raise exception 'Task conflict' using errcode='PT409'; end if;
  if (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(p_tasks) x) then raise exception 'Duplicate task IDs' using errcode='22023'; end if;
  for t in select * from jsonb_array_elements(p_tasks) loop
    if (t->>'ownerId')::uuid is distinct from p_owner or jsonb_typeof(t->'subtasks') is distinct from 'array' or jsonb_array_length(t->'subtasks')>100 then
      raise exception 'Invalid task ownership or subtasks' using errcode='22023';
    end if;
    v_task_id := (t->>'id')::uuid;
    insert into public.user_tasks(user_id,id,title,notes,difficulty,urgency,importance,deadline,estimated_minutes,status,previous_status,rank,completed_at,created_at,updated_at)
    values(p_owner,v_task_id,t->>'title',t->>'notes',(t->>'difficulty')::smallint,(t->>'urgency')::smallint,(t->>'importance')::smallint,
      (t->>'deadline')::date,(t->>'minutes')::integer,t->>'status',t->>'previousStatus',(t->>'rank')::integer,(t->>'completedAt')::timestamptz,(t->>'createdAt')::timestamptz,(t->>'updatedAt')::timestamptz)
    on conflict(user_id,id) do update set title=excluded.title,notes=excluded.notes,difficulty=excluded.difficulty,urgency=excluded.urgency,
      importance=excluded.importance,deadline=excluded.deadline,estimated_minutes=excluded.estimated_minutes,status=excluded.status,
      previous_status=excluded.previous_status,rank=excluded.rank,completed_at=excluded.completed_at,updated_at=excluded.updated_at;
    if (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(t->'subtasks') x) then raise exception 'Duplicate subtask IDs' using errcode='22023'; end if;
    delete from public.user_subtasks where user_id=p_owner and user_subtasks.task_id=v_task_id and id not in (select (x->>'id')::uuid from jsonb_array_elements(t->'subtasks') x);
    for s in select * from jsonb_array_elements(t->'subtasks') loop
      insert into public.user_subtasks(user_id,task_id,id,title,rank,completed_at)
      values(p_owner,v_task_id,(s->>'id')::uuid,s->>'title',(s->>'rank')::integer,(s->>'completedAt')::timestamptz)
      on conflict(user_id,task_id,id) do update set title=excluded.title,rank=excluded.rank,completed_at=excluded.completed_at;
    end loop;
  end loop;
  delete from public.user_tasks where user_id=p_owner and id not in (select (x->>'id')::uuid from jsonb_array_elements(p_tasks) x);
  update public.task_collections set revision=current_row.revision+1, mutation_id=p_mutation,
    imported_ids=array(select distinct unnest(current_row.imported_ids || p_import_ids)) where user_id=p_owner;
  return public.read_tasks(p_owner);
end $$;
commit;
