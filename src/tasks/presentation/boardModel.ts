import type { Task } from './model';
export const statuses = ['later', 'next', 'doing', 'done'] as const;
export type Status = typeof statuses[number];
export type BoardTask = Task & { status: Status };
