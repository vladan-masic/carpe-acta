/** Only explicitly confirmed sessions belong here; task completion is independent. */
export const outcomes = ['progress', 'subtask', 'task', 'stopped'] as const;
export type FocusOutcome = typeof outcomes[number];
export type FocusEntry = {
  id: string;
  sessionId: string;
  ownerId: string | null;
  taskId: string;
  subtaskId: string | null;
  startedAt: string | null; // Legacy active sessions did not retain a start timestamp.
  endedAt: string;
  focusedSeconds: number;
  chosenMinutes: number;
  outcome: FocusOutcome | null;
  createdAt: string;
};
export const MAX_FOCUSED_SECONDS = 12 * 60 * 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const date = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(Date.parse(v));
export function parseEntry(value: unknown, owner: string | null): FocusEntry {
  const e = value as FocusEntry;
  if (!e || ![e.id,e.sessionId,e.taskId].every(v => typeof v === 'string' && uuid.test(v))
    || e.id !== e.sessionId || e.ownerId !== owner || !(e.subtaskId === null || uuid.test(e.subtaskId))
    || !date(e.endedAt) || !date(e.createdAt) || !(e.startedAt === null || date(e.startedAt) && Date.parse(e.startedAt) <= Date.parse(e.endedAt))
    || !Number.isInteger(e.focusedSeconds) || e.focusedSeconds < 1 || e.focusedSeconds > MAX_FOCUSED_SECONDS
    || ![0,2,5,10,25].includes(e.chosenMinutes) || !(e.outcome === null || outcomes.includes(e.outcome))) throw new Error('Invalid focus history');
  return {id:e.id,sessionId:e.sessionId,ownerId:owner,taskId:e.taskId,subtaskId:e.subtaskId,startedAt:e.startedAt,
    endedAt:e.endedAt,focusedSeconds:e.focusedSeconds,chosenMinutes:e.chosenMinutes,outcome:e.outcome,createdAt:e.createdAt};
}
export type Period = 'week' | 'month' | 'all';
export const localDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function weekStart(now: Date): Date {
  const start = new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate() - (start.getDay()+6)%7); return start;
}
/** Group by session end in the viewer's local calendar. Calendar arithmetic handles DST. */
export function statistics(entries: FocusEntry[], period: Period, now = new Date()) {
  const start = period === 'week' ? weekStart(now) : new Date(now);
  if (period === 'month') { start.setHours(0,0,0,0); start.setDate(start.getDate()-29); }
  const selected = entries.filter(e => Date.parse(e.endedAt) <= now.getTime() && (period === 'all' || Date.parse(e.endedAt) >= start.getTime()));
  return {entries:selected, seconds:selected.reduce((sum,e)=>sum+e.focusedSeconds,0), sessions:selected.length,
    days:new Set(selected.map(e=>localDay(new Date(e.endedAt)))).size};
}
export function weeklyBars(entries: FocusEntry[], now = new Date()) {
  const start = weekStart(now);
  return Array.from({length:7},(_,i)=>{
    const day = new Date(start); day.setDate(day.getDate()+i);
    const seconds = entries.filter(e=>Date.parse(e.endedAt)<=now.getTime() && localDay(new Date(e.endedAt))===localDay(day)).reduce((sum,e)=>sum+e.focusedSeconds,0);
    return {day,seconds};
  });
}
