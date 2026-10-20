export const statuses = ['later', 'next', 'doing', 'done'] as const;
export type Status = typeof statuses[number];
export type OpenStatus = Exclude<Status, 'done'>;
export type Task = {
  id: string; ownerId: string | null; title: string; notes: string;
  difficulty: 1 | 2 | 3 | 4 | 5; urgency: 0 | 1 | 2 | 3; importance: 0 | 1 | 2;
  deadline: string | null; minutes: number | null; status: Status; previousStatus: OpenStatus;
  rank: number; completedAt: string | null; createdAt: string; updatedAt: string;
  subtasks: { id: string; title: string; rank: number; completedAt: string | null }[];
};
export type Snapshot = { revision: number; tasks: Task[]; importedIds: string[]; mutationId: string | null };
export const emptySnapshot = (): Snapshot => ({ revision: 0, tasks: [], importedIds: [], mutationId: null });
export const MAX_TASKS = 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const integer = (v: unknown, min: number, max: number) => Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
export function validTasks(value: unknown, owner: string | null): value is Task[] {
  if (!Array.isArray(value) || value.length > MAX_TASKS) return false;
  const ids = new Set<string>();
  return value.every(t => {
    if (!t || typeof t !== 'object' || !uuid.test(t.id) || ids.has(t.id) || t.ownerId !== owner) return false;
    ids.add(t.id);
    if (typeof t.title !== 'string' || !t.title.trim() || t.title.length > 200 || typeof t.notes !== 'string' || t.notes.length > 10000) return false;
    if (!integer(t.difficulty,1,5) || !integer(t.urgency,0,3) || !integer(t.importance,0,2) || !integer(t.rank,0,1000000)) return false;
    if (!statuses.includes(t.status) || !['later','next','doing'].includes(t.previousStatus) || (t.status!=='done' && t.previousStatus!==t.status)) return false;
    if (!timestamp(t.createdAt) || !timestamp(t.updatedAt) || (t.status === 'done' ? !timestamp(t.completedAt) : t.completedAt !== null)) return false;
    if (t.minutes !== null && !integer(t.minutes,1,10000)) return false;
    if (t.deadline !== null && (typeof t.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.deadline) || !Number.isFinite(Date.parse(t.deadline)) || new Date(t.deadline).toISOString().slice(0,10) !== t.deadline)) return false;
    if (!Array.isArray(t.subtasks) || t.subtasks.length > 100) return false;
    const stepIds = new Set<string>();
    return t.subtasks.every((s: Task['subtasks'][number]) => {
      if (!s || !uuid.test(s.id) || stepIds.has(s.id)) return false;
      stepIds.add(s.id);
      return typeof s.title === 'string' && !!s.title.trim() && s.title.length <= 200 && integer(s.rank,0,1000000) && (s.completedAt === null || timestamp(s.completedAt));
    });
  });
}
export function parseSnapshot(value: unknown, owner: string | null): Snapshot {
  const s = value as Snapshot;
  if (!s || !integer(s.revision,0,Number.MAX_SAFE_INTEGER) || !validTasks(s.tasks,owner) || !Array.isArray(s.importedIds) || !s.importedIds.every(id=>typeof id==='string' && uuid.test(id)) || (s.mutationId !== null && !uuid.test(s.mutationId))) throw new Error('corrupt');
  return s;
}
export function newTask(title: string, ownerId: string | null, status: Status, tasks: Task[], now = new Date().toISOString()): Task {
  return { id: crypto.randomUUID(), ownerId, title: title.trim(), notes: '', difficulty: 1, urgency: 0, importance: 1, deadline: null, minutes: null,
    status, previousStatus: status === 'done' ? 'next' : status, rank: Math.max(-1,...tasks.filter(t=>t.status===status).map(t=>t.rank))+1,
    completedAt: status === 'done' ? now : null, createdAt: now, updatedAt: now, subtasks: [] };
}
export const manual = (tasks: Task[]) => [...tasks].sort((a,b)=> statuses.indexOf(a.status)-statuses.indexOf(b.status) || a.rank-b.rank || a.id.localeCompare(b.id));
export function editTask(tasks: Task[], id: string, patch: Partial<Omit<Task,'id'|'ownerId'|'createdAt'>>, now = new Date().toISOString()): Task[] {
  return tasks.map(t=>t.id!==id?t:{...t,...patch,updatedAt:now});
}
export function moveTask(tasks: Task[], id: string, status: Status, beforeId: string | null = null, now = new Date().toISOString()): Task[] {
  const current = tasks.find(t=>t.id===id);
  if (!current || beforeId===id) return tasks;
  const peers = manual(tasks.filter(t=>t.status===status && t.id!==id));
  const before = peers.findIndex(t=>t.id===beforeId);
  const moved: Task = { ...current, status, previousStatus: status==='done' ? current.status==='done'?current.previousStatus:current.status : status, completedAt: status==='done' ? current.completedAt ?? now : null, updatedAt:now };
  peers.splice(before < 0 ? peers.length : before,0,moved);
  const byId = new Map(peers.map((task,rank)=>[task.id,{...task,rank,updatedAt:task.rank===rank?task.updatedAt:now}]));
  return tasks.map(t=>byId.get(t.id)??t);
}
export function completeTask(tasks: Task[], id: string, done: boolean): Task[] {
  const task=tasks.find(t=>t.id===id);
  return task ? moveTask(tasks,id,done?'done':task.previousStatus) : tasks;
}
export type Filter = 'all'|'today'|'upcoming'|'someday'|'completed';
export type Sort = 'manual'|'deadline';
export function visibleTasks(tasks: Task[], filter: Filter, sort: Sort, today: string): Task[] {
  const result=manual(tasks).filter(t=>filter==='all'||(filter==='completed'?t.status==='done':t.status!=='done'&&(filter==='today'?t.deadline===today:filter==='upcoming'?!!t.deadline&&t.deadline>today:!t.deadline)));
  return sort==='manual'?result:result.sort((a,b)=>(a.deadline??'9999').localeCompare(b.deadline??'9999')||a.rank-b.rank||a.id.localeCompare(b.id));
}

/** Import receipts survive deletion; existing IDs must never be imported twice. */
export function eligibleGuestTasks(guest: Snapshot, account: Pick<Snapshot, 'tasks' | 'importedIds'>): Task[] {
  const seen = new Set([...account.importedIds, ...account.tasks.map(task => task.id)]);
  return manual(guest.tasks).filter(task => !seen.has(task.id));
}
