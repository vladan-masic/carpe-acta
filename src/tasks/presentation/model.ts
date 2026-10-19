import type { Locale } from '../../i18n/locales';
export type Text = Record<Locale, string>;
export type Subtask = { id: string; title: Text; done: boolean };
export type Task = { id: string; title: Text; notes: Text; difficulty: number; urgency: number; importance: number; deadline: string; minutes: string; done: boolean; subtasks: Subtask[] };
export type View = 'all' | 'today' | 'upcoming' | 'someday' | 'completed';
export const bilingual = (en: string, sr: string): Text => ({ en, 'sr-Latn': sr });
export const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function moveItem<T extends {id: string}>(items: T[], id: string, offset: number): T[] {
  const from = items.findIndex(t => t.id === id), to = from + offset;
  if (from < 0 || to < 0 || to >= items.length) return items;
  const next = [...items]; [next[from],next[to]] = [next[to],next[from]]; return next;
}
