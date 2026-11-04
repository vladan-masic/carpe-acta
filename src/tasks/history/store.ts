import type { FocusEntry } from './domain';
import { readHistory, type HistoryAdapter, type HistorySnapshot } from './persistence';
type State = HistorySnapshot & {ready:boolean;busy:boolean;error:boolean};
export class HistoryStore {
  private state: State = {entries:[],seen:[],ready:false,busy:false,error:false};
  private listeners = new Set<()=>void>();
  private generation = 0;
  constructor(readonly owner: string | null, private adapter: HistoryAdapter) {}
  getSnapshot = () => this.state;
  subscribe = (fn:()=>void) => {this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
  private publish(patch: Partial<State>) {this.state={...this.state,...patch};this.listeners.forEach(fn=>fn());}
  refresh = async () => {
    if(this.state.busy)return;
    const generation=++this.generation;
    try {const snapshot=await this.adapter.load();if(generation===this.generation)this.publish({...snapshot,ready:true,error:false});}
    catch {if(generation===this.generation)this.publish({error:true});}
  };
  save = async (entry: FocusEntry) => {
    ++this.generation;
    const saved=await this.adapter.save(entry);
    this.publish({entries:[...this.state.entries.filter(e=>e.sessionId!==entry.sessionId),...(saved?[saved]:[])],
      seen:[...new Set([...this.state.seen,entry.sessionId])]});
    // Reconcile other tabs' writes. A failed refresh does not undo a confirmed save.
    void this.refresh();
  };
  remove = async (id: string) => {
    if(this.state.busy)return false;
    ++this.generation;this.publish({busy:true,error:false});
    try {await this.adapter.remove(id);this.publish({entries:this.state.entries.filter(e=>e.id!==id),busy:false});await this.refresh();return true;}
    catch {this.publish({busy:false,error:true});return false;}
  };
  importGuest = async () => {
    if(!this.owner || this.state.busy || !this.state.ready)return;
    ++this.generation;this.publish({busy:true,error:false});
    try {
      const guest=readHistory();
      for(const entry of guest.entries) if(!this.state.seen.includes(entry.sessionId)) {
        const saved=await this.adapter.save({...entry,ownerId:this.owner});
        this.publish({entries:[...this.state.entries,...(saved?[saved]:[])],seen:[...this.state.seen,entry.sessionId]});
      }
      this.publish({busy:false});await this.refresh();
    } catch {this.publish({busy:false,error:true});}
  };
  connect() {
    void this.refresh();const refresh=()=>void this.refresh();
    const unsubscribe=this.adapter.subscribe?.(refresh);
    const visible=()=>{if(document.visibilityState==='visible')refresh();};
    window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);
    return()=>{unsubscribe?.();window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);};
  }
}
