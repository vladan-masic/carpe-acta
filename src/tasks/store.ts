import { emptySnapshot, manual, validTasks, type Snapshot, type Task } from './domain';
import { TaskError, type Save, type TaskAdapter } from './persistence';

export type StoreState = Snapshot & { ready: boolean; dirty: boolean; saving: boolean; error: TaskError['code'] | null };
/** One owner-scoped collection. Never merges a stale snapshot over pending edits. */
export class TaskStore {
  private state: StoreState = { ...emptySnapshot(), ready: false, dirty: false, saving: false, error: null };
  private listeners = new Set<()=>void>();
  private generation = 0;
  private editVersion = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pending: { change: Save; version: number } | null = null;
  constructor(readonly owner: string | null, private adapter: TaskAdapter) {}
  getSnapshot = () => this.state;
  subscribe = (listener: ()=>void) => { this.listeners.add(listener); return ()=>{this.listeners.delete(listener);}; };
  private publish(patch: Partial<StoreState>) { this.state={...this.state,...patch}; this.listeners.forEach(f=>f()); }
  async refresh() {
    if(this.state.dirty || this.state.saving) return;
    const generation=++this.generation;
    try { const snapshot=await this.adapter.load();
      if(generation===this.generation && !this.state.dirty) this.publish({...snapshot,ready:true,error:null});
    } catch(error) { if(generation===this.generation) this.publish({error:this.errorCode(error),ready:this.state.ready || this.errorCode(error)==='storage'}); }
  }
  private errorCode(error: unknown): TaskError['code'] { return error instanceof TaskError ? error.code : 'network'; }
  edit(update: (tasks: Task[])=>Task[], importedIds=this.state.importedIds) {
    if(!this.state.ready) return;
    this.editVersion++;
    this.publish({tasks:update(this.state.tasks),importedIds,dirty:true,error:this.state.error==='invalid'?null:this.state.error});
    clearTimeout(this.timer);
    if(!this.state.error) this.timer=setTimeout(()=>void this.flush(),400);
  }
  async flush() {
    clearTimeout(this.timer);
    if(!this.state.dirty || this.state.saving || !this.state.ready) return;
    if(!this.pending && !validTasks(this.state.tasks,this.owner)) { this.publish({error:'invalid'}); return; }
    this.pending ??= { change: {base:this.state.revision,mutationId:crypto.randomUUID(),tasks:this.state.tasks,importedIds:this.state.importedIds},version:this.editVersion };
    const pending=this.pending;
    this.publish({saving:true,error:null});
    try {
      const snapshot=await this.adapter.save(pending.change);
      this.pending=null;
      const newer=this.editVersion!==pending.version;
      this.publish({...(newer?{revision:snapshot.revision,mutationId:snapshot.mutationId}:snapshot),saving:false,dirty:newer,error:null});
      if(newer) void this.flush();
    } catch(error) { const code=this.errorCode(error);if(code==='invalid')this.pending=null;this.publish({saving:false,error:code}); }
  }
  /** Explicitly authorized discard only; caller offers a recovery download first. */
  async reloadServer() {
    if(this.state.saving) return;
    clearTimeout(this.timer); this.pending=null;
    // Load first: a network error must not erase local edits.
    const version=this.editVersion;
    try { const snapshot=await this.adapter.load();
      if(version!==this.editVersion) return;
      this.publish({...snapshot,ready:true,dirty:false,error:null});
    } catch(error) { this.publish({error:this.errorCode(error)}); }
  }
  importGuest(guest: Snapshot) {
    if(!this.owner || !this.state.ready || this.state.saving || this.state.error) return;
    const seen=new Set([...this.state.importedIds,...this.state.tasks.map(t=>t.id)]);
    const added=manual(guest.tasks).filter(t=>!seen.has(t.id));
    if(!added.length) return;
    const result=[...this.state.tasks];
    for(const task of added) result.push({...task,ownerId:this.owner,rank:Math.max(-1,...result.filter(t=>t.status===task.status).map(t=>t.rank))+1});
    if(!validTasks(result,this.owner)) { this.publish({error:'invalid'});return; }
    this.edit(()=>result,[...new Set([...this.state.importedIds,...added.map(t=>t.id)])]);
  }
  connect() {
    void this.refresh();
    const refresh=()=>void this.refresh();
    const unsubscribe=this.adapter.subscribe?.(refresh);
    window.addEventListener('focus',refresh);
    const visible=()=>{if(document.visibilityState==='visible')refresh();};
    document.addEventListener('visibilitychange',visible);
    const beforeUnload=(event:BeforeUnloadEvent)=>{ if(this.state.dirty){event.preventDefault();event.returnValue='';} };
    window.addEventListener('beforeunload',beforeUnload);
    return ()=>{unsubscribe?.();window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);window.removeEventListener('beforeunload',beforeUnload);};
  }
}
