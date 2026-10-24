export const FOCUS_VERSION = 1;
export const focusKey = (scope: string) => `carpe-acta.focus.v1:${scope}`;
export const focusDurations = [2, 5, 10, 25, 0] as const;
export type FocusPhase = 'running' | 'paused' | 'expired' | 'review';
export type FocusSession = {
  version: 1; id: string; scope: string; taskId: string; subtaskId: string | null;
  text: string; minutes: number; phase: FocusPhase; elapsedMs: number;
  anchorMs: number | null; overtime: boolean;
};
export type FocusInput = Pick<FocusSession, 'taskId' | 'subtaskId' | 'text' | 'minutes'>;
export type FocusState = { session: FocusSession | null; error: 'storage' | 'corrupt' | 'conflict' | null };
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type FocusCommand = 'pause' | 'resume' | 'reset' | 'finish' | 'continue' | 'end';
const MAX_TIME = 366 * 24 * 60 * 60 * 1000;
const identifier = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 200;

export function parseFocus(raw: string | null, scope: string): FocusSession | null {
  if (raw === null) return null;
  const s = JSON.parse(raw) as FocusSession;
  if (!s || s.version !== FOCUS_VERSION || s.scope !== scope || !identifier(s.id) || !identifier(s.taskId)
    || !(s.subtaskId === null || identifier(s.subtaskId)) || typeof s.text !== 'string' || !s.text.trim() || s.text.length > 200
    || !(focusDurations as readonly number[]).includes(s.minutes) || !['running','paused','expired','review'].includes(s.phase)
    || !Number.isSafeInteger(s.elapsedMs) || s.elapsedMs < 0 || s.elapsedMs > MAX_TIME || typeof s.overtime !== 'boolean'
    || !(s.anchorMs === null || Number.isSafeInteger(s.anchorMs) && s.anchorMs >= 0)
    || (s.phase === 'running') !== (s.anchorMs !== null)) throw new Error('Invalid focus record');
  // Do not retain unknown fields from storage.
  return {version:1,id:s.id,scope,taskId:s.taskId,subtaskId:s.subtaskId,text:s.text,minutes:s.minutes,
    phase:s.phase,elapsedMs:s.elapsedMs,anchorMs:s.anchorMs,overtime:s.overtime};
}

/** No ticking writes. Wall-clock timestamps survive suspended tabs and browser restarts. */
export function focusAt(session: FocusSession, now: number): FocusSession {
  if (session.phase !== 'running' || session.anchorMs === null) return session;
  // A backwards clock pauses rather than extending or subtracting earned focus time.
  if (now < session.anchorMs) return {...session,phase:'paused',anchorMs:null};
  const elapsedMs = Math.min(MAX_TIME, session.elapsedMs + Math.max(0, now - session.anchorMs));
  if (session.minutes && !session.overtime && elapsedMs >= session.minutes * 60000)
    return {...session,elapsedMs:session.minutes*60000,phase:'expired',anchorMs:null};
  return {...session,elapsedMs,anchorMs:now};
}
export function focusSeconds(session: FocusSession) {
  return session.minutes && !session.overtime ? Math.ceil(Math.max(0, session.minutes*60000-session.elapsedMs)/1000) : Math.floor(session.elapsedMs/1000);
}

/** Owner-scoped local controller. Task completion intentionally lives outside this module. */
export class FocusController {
  private state: FocusState = {session:null,error:null};
  private listeners = new Set<() => void>();
  private unsaved = false;
  private baseline: string | null = null;
  readonly key: string;
  constructor(readonly scope: string, private storage: () => StoragePort | null = () => window.localStorage,
    private clock: () => number = Date.now) { this.key=focusKey(scope); this.restore(); }
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private publish(session: FocusSession | null, error: FocusState['error']) {
    this.state={session,error}; this.listeners.forEach(fn=>fn());
  }
  restore = () => {
    if (this.unsaved) return; // Never replace an in-memory transition after a failed write.
    let raw: string|null;
    try { const storage=this.storage(); if(!storage)return; raw=storage.getItem(this.key); }
    catch { this.publish(this.state.session,'storage'); return; }
    try {
      this.baseline=raw;
      const session=parseFocus(raw,this.scope);
      const restored=session?focusAt(session,this.clock()):null;
      this.publish(restored,null);
      if(session && restored && session.phase!==restored.phase) {
        // Persist expiry/clock recovery once, without overwriting a newer tab transition.
        void this.locked(()=>{
          if(!this.unsaved && this.state.session?.id===restored.id && this.storage()?.getItem(this.key)===raw)this.persist(restored);
        }).catch(()=>this.publish(this.state.session,'storage'));
      }
    }
    catch { this.publish(null,'corrupt'); }
  };
  private persist(session: FocusSession|null) {
    try {
      const storage=this.storage();
      if(storage) {
        if(storage.getItem(this.key)!==this.baseline){this.unsaved=true;this.publish(session,'conflict');return;}
        const raw=session?JSON.stringify(session):null;
        if(raw)storage.setItem(this.key,raw);else storage.removeItem(this.key);
        this.baseline=raw;
      }
      this.unsaved=false; this.publish(session,null);
    } catch { this.unsaved=true; this.publish(session,'storage'); }
  }
  private locked<T>(work:()=>T): Promise<T> {
    // Web Locks serialize starts/transitions across same-origin tabs. Older browsers use latest-read/last-write.
    if(typeof navigator!=='undefined' && navigator.locks) return navigator.locks.request(this.key,work);
    return Promise.resolve(work());
  }
  private transact<T>(action:()=>T): Promise<T> {
    return this.locked(()=>{this.restore();return action();});
  }
  useSaved = () => { this.unsaved=false;this.restore(); };
  retry = () => this.transact(()=>this.persist(this.state.session));
  start(input: FocusInput, replaceId?: string): Promise<boolean> {
    return this.transact(()=>{
      const current=this.state.session;
      if(current && current.id!==replaceId || replaceId && current?.id!==replaceId)return false;
      const candidate:FocusSession={version:1,id:crypto.randomUUID(),scope:this.scope,...input,text:input.text.trim(),
        phase:'running',elapsedMs:0,anchorMs:this.clock(),overtime:false};
      parseFocus(JSON.stringify(candidate),this.scope);
      this.persist(candidate);return true;
    });
  }
  command(command:FocusCommand,id:string):Promise<boolean> {
    return this.transact(()=>{
      const current=this.state.session;
      if(!current || current.id!==id)return false;
      const now=this.clock(); let s=focusAt(current,now);
      switch(command) {
        case 'end': this.persist(null);return true;
        case 'pause': if(s.phase==='running')s={...s,phase:'paused',anchorMs:null};break;
        case 'resume': if(s.phase==='paused')s={...s,phase:'running',anchorMs:now};break;
        case 'reset': s={...s,phase:'paused',elapsedMs:0,anchorMs:null,overtime:false};break;
        case 'finish': s={...s,phase:'review',anchorMs:null};break;
        case 'continue':
          if(s.phase==='expired' || s.phase==='review') {
            const expired=Boolean(s.minutes&&!s.overtime&&s.elapsedMs>=s.minutes*60000);
            s={...s,phase:'running',anchorMs:now,overtime:s.overtime||expired,elapsedMs:expired?0:s.elapsedMs};
          }break;
      }
      this.persist(s);return true;
    });
  }
  connect() {
    this.restore();
    const storage=(e:StorageEvent)=>{if(e.key===this.key || e.key===null)this.restore();};
    const refresh=()=>this.restore();
    const guard=(event:BeforeUnloadEvent)=>{if(this.unsaved){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',guard);
    window.addEventListener('storage',storage);window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return()=>{window.removeEventListener('beforeunload',guard);window.removeEventListener('storage',storage);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  }
}
