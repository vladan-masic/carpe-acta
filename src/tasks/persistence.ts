import type { SupabaseClient } from '@supabase/supabase-js';
import { emptySnapshot, parseSnapshot, type Snapshot } from './domain';
export const GUEST_KEY = 'carpe-acta.tasks.v1';
export type Save = { base: number; mutationId: string; tasks: Snapshot['tasks']; importedIds: string[] };
export type TaskAdapter = { load(): Promise<Snapshot>; save(change: Save): Promise<Snapshot>; subscribe?(refresh:()=>void):()=>void };
export class TaskError extends Error {
  constructor(public code: 'conflict'|'storage'|'corrupt'|'account'|'network'|'invalid') { super(code); }
}
export function readGuest(storage?: Pick<Storage,'getItem'>): Snapshot {
  try {
    const raw=(storage ?? window.localStorage).getItem(GUEST_KEY);
    if (!raw) return emptySnapshot();
    const data=JSON.parse(raw);
    if (data.version!==1) throw new Error('corrupt');
    return parseSnapshot(data.snapshot,null);
  } catch (error) { throw new TaskError(error instanceof SyntaxError || error instanceof Error && error.message==='corrupt'?'corrupt':'storage'); }
}
export function guestAdapter(): TaskAdapter {
  return {
    load: async()=>readGuest(),
    save: async change => {
      if (!navigator.locks) throw new TaskError('storage');
      return navigator.locks.request(GUEST_KEY, async()=> {
        const current=readGuest();
        if (current.mutationId===change.mutationId) return current;
        if (current.revision!==change.base) throw new TaskError('conflict');
        const next=parseSnapshot({revision:change.base+1,mutationId:change.mutationId,tasks:change.tasks,importedIds:[]},null);
        try { localStorage.setItem(GUEST_KEY,JSON.stringify({version:1,snapshot:next})); } catch { throw new TaskError('storage'); }
        return next;
      });
    },
    subscribe: refresh=> {
      const handler=(e:StorageEvent)=>{if(e.key===GUEST_KEY || e.key===null)refresh();};
      window.addEventListener('storage',handler);return()=>window.removeEventListener('storage',handler);
    },
  };
}
export function accountAdapter(client: SupabaseClient, owner: string): TaskAdapter {
  async function call(name: string, args: Record<string,unknown>) {
    const {data:{session}}=await client.auth.getSession();
    if (session?.user.id!==owner) throw new TaskError('account');
    const {data,error}=await client.rpc(name,{p_owner:owner,...args});
    if(error)throw new TaskError(['PT409','40001'].includes(error.code)?'conflict':error.code==='42501'?'account':['22023','23514','23502','22007','22008'].includes(error.code)?'invalid':'network');
    try{return parseSnapshot(data,owner);}catch{throw new TaskError('invalid');}
  }
  return { load:()=>call('read_tasks',{}), save:change=>call('write_tasks',{p_expected:change.base,p_mutation:change.mutationId,p_tasks:change.tasks,p_import_ids:change.importedIds}) };
}
