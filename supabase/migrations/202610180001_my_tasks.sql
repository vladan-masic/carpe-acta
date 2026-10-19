begin;
-- Separate from tip completion and favorites. All foreign keys include ownership.
create table public.user_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 200),
  notes text not null default '' check (length(notes) <= 10000),
  difficulty smallint not null check (difficulty between 1 and 5),
  urgency smallint not null check (urgency between 0 and 3),
  importance smallint not null check (importance between 0 and 2),
  deadline date, estimated_minutes integer check (estimated_minutes between 1 and 10000),
  status text not null check (status in ('later','next','doing','done')),
  previous_status text not null check (previous_status in ('later','next','doing')),
  rank integer not null check (rank between 0 and 1000000),
  completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (user_id,id),
  check ((status = 'done') = (completed_at is not null)),
  check (status = 'done' or previous_status = status)
);
create index user_tasks_order on public.user_tasks(user_id,status,rank,id);
create index user_tasks_deadline on public.user_tasks(user_id,deadline);
create table public.user_subtasks (
  user_id uuid not null, task_id uuid not null, id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 200),
  rank integer not null check (rank between 0 and 1000000), completed_at timestamptz,
  primary key (user_id,task_id,id),
  foreign key (user_id,task_id) references public.user_tasks(user_id,id) on delete cascade
);
create table public.task_collections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  mutation_id uuid,
  imported_ids uuid[] not null default '{}'
);
-- Imported IDs are retained after task deletion to prevent re-import resurrecting it.
alter table public.user_tasks enable row level security;
alter table public.user_subtasks enable row level security;
alter table public.task_collections enable row level security;
revoke all on public.user_tasks, public.user_subtasks, public.task_collections from anon, authenticated;
grant select, insert, update, delete on public.user_tasks, public.user_subtasks, public.task_collections to authenticated;
create policy "Own tasks" on public.user_tasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own subtasks" on public.user_subtasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own task collection" on public.task_collections for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Direct owner-authorized table changes also invalidate snapshots. RPC saves hold
-- this row lock before touching tasks, and publish one final collection revision.
create function public.task_changed() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare owner uuid;
begin
  owner := case when TG_OP='DELETE' then old.user_id else new.user_id end;
  -- Auth-user cascades may already have removed the owner.
  if exists(select 1 from public.task_collections where user_id=owner) then
    update public.task_collections set revision=revision+1,mutation_id=null where user_id=owner;
  elsif TG_OP<>'DELETE' then
    insert into public.task_collections(user_id,revision) values(owner,1)
      on conflict(user_id) do update set revision=task_collections.revision+1,mutation_id=null;
  end if;
  return null;
end $$;
create trigger task_changed after insert or update or delete on public.user_tasks for each row execute function public.task_changed();
create trigger subtask_changed after insert or update or delete on public.user_subtasks for each row execute function public.task_changed();
create function public.task_updated_at() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  new.created_at=old.created_at;
  if new is distinct from old then new.updated_at=clock_timestamp(); end if;
  return new;
end $$;
create trigger task_updated_at before update on public.user_tasks for each row execute function public.task_updated_at();
revoke all on function public.task_changed(), public.task_updated_at() from public,anon;

create function public.read_tasks(p_owner uuid) returns jsonb
language plpgsql stable security invoker set search_path = public, pg_temp as $$
declare result jsonb;
begin
  if auth.uid() is null or auth.uid() is distinct from p_owner then raise exception 'Not authorized' using errcode='42501'; end if;
  select jsonb_build_object(
    'revision', coalesce(c.revision,0), 'mutationId', c.mutation_id,
    'importedIds', coalesce(to_jsonb(c.imported_ids),'[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(jsonb_build_object(
      'id',t.id, 'ownerId',t.user_id,'title',t.title,'notes',t.notes,
      'difficulty',t.difficulty,'urgency',t.urgency,'importance',t.importance,
      'deadline',t.deadline,'minutes',t.estimated_minutes,'status',t.status,'previousStatus',t.previous_status,
      'rank',t.rank,'completedAt',t.completed_at,'createdAt',t.created_at,'updatedAt',t.updated_at,
      'subtasks',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'title',s.title,'rank',s.rank,'completedAt',s.completed_at) order by s.rank,s.id)
        from public.user_subtasks s where s.user_id=t.user_id and s.task_id=t.id),'[]'::jsonb)
    ) order by t.status,t.rank,t.id) from public.user_tasks t where t.user_id=p_owner),'[]'::jsonb))
  into result from (select 1) seed left join public.task_collections c on c.user_id=p_owner;
  return result;
end $$;

-- Compare-and-swap on the entire small collection: no partial cross-column moves.
-- A conflict aborts the transaction, preserving the newer server collection.
create function public.write_tasks(p_owner uuid, p_expected bigint, p_mutation uuid, p_tasks jsonb, p_import_ids uuid[] default '{}') returns jsonb
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
  if current_row.revision<>p_expected then raise exception 'Task conflict' using errcode='40001'; end if;
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
revoke all on function public.read_tasks(uuid), public.write_tasks(uuid,bigint,uuid,jsonb,uuid[]) from public, anon;
grant execute on function public.read_tasks(uuid), public.write_tasks(uuid,bigint,uuid,jsonb,uuid[]) to authenticated;
commit;
