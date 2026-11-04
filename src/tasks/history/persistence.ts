import type { SupabaseClient } from '@supabase/supabase-js';
import { parseEntry, type FocusEntry } from './domain';
export const HISTORY_KEY = 'carpe-acta.focus-history.v1';
export type HistorySnapshot = {entries: FocusEntry[]; seen: string[]};
export type HistoryAdapter = {
  load(): Promise<HistorySnapshot>;
  save(entry: FocusEntry): Promise<FocusEntry | null>;
  remove(id: string): Promise<void>;
  subscribe?(refresh: () => void): () => void;
};
export function readHistory(storage: Pick<Storage,'getItem'> = window.localStorage): HistorySnapshot {
  const raw = storage.getItem(HISTORY_KEY);
  if (raw === null) return {entries:[],seen:[]};
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.entries) || !Array.isArray(data.seen)
    || !data.seen.every((id: unknown)=>typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id))) throw new Error('Invalid history storage');
  const entries: FocusEntry[] = data.entries.map((e: unknown)=>parseEntry(e,null));
  if (new Set(entries.map(e=>e.sessionId)).size !== entries.length || entries.some(e=>!data.seen.includes(e.sessionId))) throw new Error('Invalid history receipts');
  return {entries,seen:[...new Set<string>(data.seen)]};
}
export function guestHistory(): HistoryAdapter {
  async function change<T>(work: (state: HistorySnapshot)=>T): Promise<T> {
    if (!navigator.locks) throw new Error('Safe browser storage unavailable');
    return navigator.locks.request(HISTORY_KEY,()=>{
      const state = readHistory(); // Never overwrite corrupt or unreadable data.
      const result = work(state);
      localStorage.setItem(HISTORY_KEY,JSON.stringify({version:1,...state}));
      return result;
    });
  }
  return {
    load:async()=>readHistory(),
    save:entry=>change(state=>{
      const valid = parseEntry(entry,null);
      if (!state.seen.includes(valid.sessionId)) {state.entries.push(valid);state.seen.push(valid.sessionId);}
      return state.entries.find(e=>e.sessionId===valid.sessionId)??null;
    }),
    remove:id=>change(state=>{state.entries=state.entries.filter(e=>e.id!==id);}),
    subscribe:refresh=>{
      const handler=(e: StorageEvent)=>{if(e.key===HISTORY_KEY || e.key===null)refresh();};
      window.addEventListener('storage',handler);return()=>window.removeEventListener('storage',handler);
    },
  };
}
const toRow = (e: FocusEntry) => ({user_id:e.ownerId,id:e.id,session_id:e.sessionId,task_id:e.taskId,subtask_id:e.subtaskId,
  started_at:e.startedAt,ended_at:e.endedAt,focused_seconds:e.focusedSeconds,chosen_minutes:e.chosenMinutes,outcome:e.outcome,created_at:e.createdAt});
const fromRow = (r: Record<string,unknown>, owner: string) => parseEntry({id:r.id,sessionId:r.session_id,ownerId:r.user_id,
  taskId:r.task_id,subtaskId:r.subtask_id,startedAt:r.started_at,endedAt:r.ended_at,focusedSeconds:r.focused_seconds,
  chosenMinutes:r.chosen_minutes,outcome:r.outcome,createdAt:r.created_at},owner);
export function accountHistory(client: SupabaseClient, owner: string): HistoryAdapter {
  async function authorize() {
    const {data,error}=await client.auth.getSession();
    if(error || data.session?.user.id!==owner)throw new Error('Account changed');
  }
  // Stable keyset pagination avoids shifting offsets during concurrent writes and Supabase's default row limit silently truncating aggregates.
  async function rows(table: string, columns: string) {
    const all: Record<string,unknown>[]=[];
    let after: string | null = null;
    for(;;){
      let query=client.from(table).select(columns).eq('user_id',owner).order('session_id').limit(500);
      if(after)query=query.gt('session_id',after);
      const {data,error}=await query;
      if(error)throw error;
      const page=data as unknown as Record<string,unknown>[];
      all.push(...page);
      if(page.length<500)return all;
      after=String(page[page.length-1].session_id);
    }
  }
  return {
    load:async()=>{
      await authorize();
      const [entries,receipts]=await Promise.all([rows('focus_history','*'),rows('focus_history_receipts','session_id')]);
      return {entries:entries.map(e=>fromRow(e,owner)),seen:receipts.map(r=>String(r.session_id))};
    },
    save:async entry=>{
      await authorize();const valid=parseEntry(entry,owner);
      const {data,error}=await client.rpc('record_focus_session',{p_entry:toRow(valid)});
      if(error)throw error;
      return data ? fromRow(data,owner) : null;
    },
    remove:async id=>{
      await authorize();const {error}=await client.from('focus_history').delete().eq('user_id',owner).eq('id',id);
      if(error)throw error;
    },
  };
}
