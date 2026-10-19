import { bilingual, sampleTasks, type Task } from '../tasks/model';

export const statuses = ['later', 'next', 'doing', 'done'] as const;
export type Status = typeof statuses[number];
export type BoardTask = Task & { status: Status };

export function boardSamples(): BoardTask[] {
  const original = sampleTasks();
  const placements: Status[] = ['next', 'next', 'next', 'doing', 'doing', 'done', 'doing'];
  const extra = [
    ['Visit Japan in spring', 'Poseti Japan na proleće', 'later', 2],
    ['Learn Spanish', 'Nauči španski', 'later', 3],
    ['Build a reading habit', 'Stekni naviku čitanja', 'later', 2],
    ['Call the dentist', 'Pozovi zubara', 'next', 1],
    ['Morning meditation', 'Jutarnja meditacija', 'done', 1],
    ['Grocery shopping', 'Kupovina namirnica', 'done', 1],
  ] as const;
  return [
    ...original.map((task, i) => ({ ...task, status: placements[i] })),
    ...extra.map(([en, sr, status, difficulty], i) => ({
      ...original[6], id: `board-${i}`, title: bilingual(en, sr),
      status, difficulty, done: status === 'done', minutes: '',
    })),
  ];
}

/** Insert before a stable task ID. Hidden cards keep their relative order. */
export function moveTask(tasks: BoardTask[], id: string, status: Status, beforeId: string | null = null): BoardTask[] {
  const task = tasks.find(item => item.id === id);
  if (!task || beforeId === id) return tasks;
  const rest = tasks.filter(item => item.id !== id);
  const anchor = rest.findIndex(item => item.id === beforeId && item.status === status);
  const last = rest.reduce((index, item, i) => item.status === status ? i : index, -1);
  const index = anchor >= 0 ? anchor : last >= 0 ? last + 1 : rest.length;
  rest.splice(index, 0, { ...task, status, done: status === 'done' });
  return rest;
}

/** Done and completion are one state; reopening explicitly returns to Next. */
export function patchTask(tasks: BoardTask[], id: string, patch: Partial<Task>): BoardTask[] {
  return tasks.map(task => task.id !== id ? task : {
    ...task, ...patch,
    status: patch.done === undefined ? task.status : patch.done ? 'done' : task.status === 'done' ? 'next' : task.status,
  });
}
