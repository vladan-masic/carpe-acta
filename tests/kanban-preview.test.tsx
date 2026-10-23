// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { KanbanPreview } from '../src/dev/kanban/KanbanPreview';
import { boardSamples, moveTask, patchTask } from '../src/dev/kanban/model';

function setup() {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('min-width'), addEventListener() {}, removeEventListener() {} }));
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  render(<KanbanPreview/>);
}
const column = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name} \\d+$`) });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('keeps status/completion consistent, preserves properties, and inserts against stable anchors', () => {
  const initial = boardSamples();
  const source = initial.find(task => task.id === 'sample-0')!;
  const moved = moveTask(initial, source.id, 'done', 'sample-5');
  expect(moved.find(task => task.id === source.id)).toEqual({ ...source, status: 'done', done: true });
  expect(moved.filter(task => task.status === 'done')[0].id).toBe(source.id);
  const reopened = patchTask(moved, source.id, { done: false });
  expect(reopened.find(task => task.id === source.id)?.status).toBe('next');
  const ordered = moveTask(initial, 'sample-2', 'next', 'sample-1');
  expect(ordered.filter(task => task.status === 'next').map(task => task.id)).toEqual(['sample-0', 'sample-2', 'sample-1', 'board-3']);
  expect(moveTask(initial, 'missing', 'done')).toBe(initial);
  expect(moveTask(initial, source.id, 'later', source.id)).toBe(initial);
});

it('adds directly to a column with title alone and never writes storage or calls the network', () => {
  const write = vi.spyOn(Storage.prototype, 'setItem');
  const fetch = vi.spyOn(globalThis, 'fetch');
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Add task: Done' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'What do you want to accomplish?' }), { target: { value: 'Write a small outline' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add task', exact: true }));
  expect(within(column('Done')).getByRole('checkbox', { name: 'Reopen: Write a small outline' })).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'dark' } });
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(write).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
});

it('moves and reorders through keyboard-accessible controls, including completion and reopening', () => {
  setup();
  const card = screen.getByRole('article', { name: 'Visit Japan in spring' });
  fireEvent.click(within(card).getByLabelText('Drag task: Visit Japan in spring'));
  fireEvent.change(within(card).getByRole('combobox', { name: 'Move to column' }), { target: { value: 'next' } });
  expect(within(column('Next')).getByRole('article', { name: 'Visit Japan in spring' })).toBeTruthy();
  const moved = screen.getByRole('article', { name: 'Visit Japan in spring' });
  fireEvent.click(within(moved).getByLabelText('Drag task: Visit Japan in spring'));
  fireEvent.click(within(moved).getByRole('button', { name: 'Move up ↑' }));
  expect(within(column('Next')).getAllByRole('article').map(card => card.getAttribute('aria-label')).slice(-2)).toEqual(['Visit Japan in spring', 'Call the dentist']);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Complete: Visit Japan in spring' }));
  expect(within(column('Done')).getByRole('article', { name: 'Visit Japan in spring' })).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Reopen: Visit Japan in spring' }));
  expect(within(column('Next')).getByRole('article', { name: 'Visit Japan in spring' })).toBeTruthy();
});

it('reuses editing, independent attributes and subtasks, and supports reversible deletion', () => {
  setup();
  const editor = within(screen.getByRole('complementary', { name: 'Details' }));
  fireEvent.change(editor.getByRole('textbox', { name: 'Task title' }), { target: { value: 'Portfolio first draft' } });
  fireEvent.click(editor.getByRole('radio', { name: '2 — Easy' }));
  fireEvent.change(editor.getByRole('combobox', { name: 'Urgency', exact: true }), { target: { value: '3' } });
  expect((editor.getByRole('combobox', { name: 'Importance' }) as HTMLSelectElement).value).toBe('1');
  expect((editor.getByRole('combobox', { name: 'Status' }) as HTMLSelectElement).value).toBe('next');
  fireEvent.change(editor.getByRole('textbox', { name: 'Add a subtask' }), { target: { value: 'Open the editor' } });
  fireEvent.click(editor.getByRole('button', { name: 'Add a subtask', exact: true }));
  fireEvent.click(editor.getByRole('checkbox', { name: 'Complete: Open the editor' }));
  expect(editor.getByText('3 of 6 completed')).toBeTruthy();
  fireEvent.click(editor.getByRole('button', { name: 'Delete task' }));
  expect(screen.queryByRole('article', { name: 'Portfolio first draft' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Undo delete' }));
  expect(within(column('Next')).getAllByRole('article')[0].getAttribute('aria-label')).toBe('Portfolio first draft');
});

it('filters visibility without modifying statuses and localizes the board and controls', () => {
  setup();
  fireEvent.click(within(screen.getByRole('group', { name: 'Filter tasks' })).getByRole('button', { name: 'Completed' }));
  expect(within(column('Next')).queryAllByRole('article')).toHaveLength(0);
  expect(within(column('Done')).getAllByRole('article')).toHaveLength(3);
  fireEvent.click(within(screen.getByRole('group', { name: 'Filter tasks' })).getByRole('button', { name: 'All' }));
  expect(within(column('Next')).getAllByRole('article')).toHaveLength(4);
  fireEvent.click(screen.getByRole('button', { name: 'Select language: English' }));
  fireEvent.click(screen.getByRole('option', { name: 'Srpski' }));
  expect(screen.getByRole('heading', { name: 'Sledeće 4' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Prevuci zadatak: Pročitaj 15 stranica knjige' })).toBeTruthy();
});

it('uses pointer capture for touch movement, waits for a threshold, and cancels safely', () => {
  vi.useFakeTimers();
  class TestPointerEvent extends MouseEvent {
    pointerId: number; isPrimary: boolean; pointerType: string;
    constructor(type: string, init: PointerEventInit) {
      super(type, init); this.pointerId = init.pointerId ?? 1; this.isPrimary = init.isPrimary ?? true; this.pointerType = init.pointerType ?? 'touch';
    }
  }
  vi.stubGlobal('PointerEvent', TestPointerEvent);
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
  setup();
  const handle = screen.getByRole('button', { name: 'Drag task: Visit Japan in spring' });
  const target = column('Done');
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn(() => target) });
  fireEvent.pointerDown(handle, { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 12, clientY: 12 });
  expect(document.querySelector('.kb-drag-ghost')).toBeNull();
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100, clientY: 100 });
  act(() => vi.advanceTimersByTime(20));
  expect(document.querySelector('.kb-drag-ghost')).toBeTruthy();
  fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 100 });
  expect(within(column('Done')).getByRole('checkbox', { name: 'Reopen: Visit Japan in spring' })).toBeTruthy();
  const nextHandle = screen.getByRole('button', { name: 'Drag task: Learn Spanish' });
  fireEvent.pointerDown(nextHandle, { pointerId: 2, button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(nextHandle, { pointerId: 2, clientX: 100, clientY: 100 });
  act(() => vi.advanceTimersByTime(20));
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(document.querySelector('.kb-drag-ghost')).toBeNull();
  expect(within(column('Later')).getByRole('article', { name: 'Learn Spanish' })).toBeTruthy();
});
