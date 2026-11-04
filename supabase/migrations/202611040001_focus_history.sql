begin;
-- Independent of task and tip completion. References survive deleted tasks/subtasks.
create table public.focus_history_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  primary key (user_id,session_id)
);
create table public.focus_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  session_id uuid not null,
  task_id uuid not null,
  subtask_id uuid,
  started_at timestamptz,
  ended_at timestamptz not null check (isfinite(ended_at)),
  focused_seconds integer not null check (focused_seconds between 1 and 43200),
  chosen_minutes integer not null check (chosen_minutes in (0,2,5,10,25)),
  outcome text check (outcome in ('progress','subtask','task','stopped')),
  created_at timestamptz not null default now() check (isfinite(created_at)),
  primary key (user_id,id),
  unique (user_id,session_id),
  check (id = session_id),
  check (started_at is null or isfinite(started_at) and started_at <= ended_at),
  foreign key (user_id,session_id) references public.focus_history_receipts(user_id,session_id)
);
create index focus_history_recent on public.focus_history(user_id,ended_at desc,id);
create index focus_history_task on public.focus_history(user_id,task_id,ended_at desc);
alter table public.focus_history enable row level security;
alter table public.focus_history_receipts enable row level security;
revoke all on public.focus_history,public.focus_history_receipts from public,anon,authenticated;
grant select,insert,delete on public.focus_history to authenticated;
grant select,insert on public.focus_history_receipts to authenticated;
create policy "Read own focus history" on public.focus_history for select to authenticated using ((select auth.uid())=user_id);
create policy "Create own focus history" on public.focus_history for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Delete own focus history" on public.focus_history for delete to authenticated using ((select auth.uid())=user_id);
create policy "Read own focus receipts" on public.focus_history_receipts for select to authenticated using ((select auth.uid())=user_id);
create policy "Create own focus receipts" on public.focus_history_receipts for insert to authenticated with check ((select auth.uid())=user_id);

-- The receipt and entry commit together. ON CONFLICT waits for concurrent saves.
-- A retained receipt with no entry means explicitly deleted, never resurrect it.
create function public.record_focus_session(p_entry jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare owner uuid := auth.uid(); sid uuid := (p_entry->>'session_id')::uuid; inserted integer; result jsonb;
begin
  if owner is null or (p_entry->>'user_id')::uuid is distinct from owner then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  insert into public.focus_history_receipts(user_id,session_id) values(owner,sid) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted=1 then
    insert into public.focus_history(user_id,id,session_id,task_id,subtask_id,started_at,ended_at,focused_seconds,chosen_minutes,outcome,created_at)
    values(owner,(p_entry->>'id')::uuid,sid,(p_entry->>'task_id')::uuid,(p_entry->>'subtask_id')::uuid,
      (p_entry->>'started_at')::timestamptz,(p_entry->>'ended_at')::timestamptz,(p_entry->>'focused_seconds')::integer,
      (p_entry->>'chosen_minutes')::integer,p_entry->>'outcome',(p_entry->>'created_at')::timestamptz);
  end if;
  select to_jsonb(h) into result from public.focus_history h where user_id=owner and session_id=sid;
  return result;
end $$;
revoke all on function public.record_focus_session(jsonb) from public,anon;
grant execute on function public.record_focus_session(jsonb) to authenticated;
commit;
