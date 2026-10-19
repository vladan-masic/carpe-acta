import type { Locale } from '../../i18n/locales';
import { taskCopy } from './copy';
import { dateKey } from './model';
import { kanbanCopy } from './boardCopy';
import { statuses, type BoardTask, type Status } from './boardModel';
import type { useBoardDrag } from './useBoardDrag';

type Props = {
  task: BoardTask; locale: Locale; selected: boolean; dragging: boolean;
  first: boolean; last: boolean; before: boolean;
  handle?: ReturnType<ReturnType<typeof useBoardDrag>['handle']>;
  open: (button: HTMLButtonElement) => void;
  move: (status: Status) => void; reorder: (direction: number) => void;
  complete: (done: boolean) => void;
};

export function BoardCard({ task, locale, selected, dragging, first, last, before, handle, open, move, reorder, complete }: Props) {
  const c = taskCopy[locale], k = kanbanCopy[locale];
  const title = task.title[locale];
  const deadline = task.deadline === dateKey() ? c.today : task.deadline
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'sr-Latn', { day: 'numeric', month: 'short' }).format(new Date(`${task.deadline}T12:00:00`)) : '';
  return <article className="kb-card" data-card-id={task.id} data-selected={selected} data-dragging={dragging}
    data-done={task.done} data-insert={before} aria-label={title}>
    <div className="kb-card-top">
      <button className="kb-card-open" onClick={event => open(event.currentTarget)} aria-label={`${c.open}: ${title}`}>
        <span className="kb-card-title">{title}</span>
        <span className="kb-card-meta">
          <span className="tasks-stars" title={`${c.difficulty}: ${c.ratings[task.difficulty - 1]}`}>{'★'.repeat(task.difficulty)}<span>{'☆'.repeat(5 - task.difficulty)}</span></span>
          <span className="tasks-badge" data-urgency={task.urgency}>{c.urgencies[task.urgency]}</span>
        </span>
        <span className="kb-card-bottom">
          {task.subtasks.length > 0 && <span>☷ {task.subtasks.filter(step => step.done).length}/{task.subtasks.length} {c.subtasks.toLowerCase()}</span>}
          {deadline && <span>▦ {deadline}</span>}
          {!deadline && !task.subtasks.length && <span>{c.noDate}</span>}
        </span>
      </button>
      <button className="kb-drag-handle" disabled={!handle} {...handle} aria-label={`${k.drag}: ${title}`} aria-describedby="kb-drag-help" data-handle-id={task.id}>⠿</button>
    </div>
    <div className="kb-card-tools">
      <label className="kb-check"><input type="checkbox" checked={task.done} aria-label={`${task.done ? c.reopen : c.complete}: ${title}`} onChange={event => complete(event.target.checked)}/><span>{task.done ? c.completed : c.complete}</span></label>
      <details className="kb-move-menu"><summary aria-label={`${k.move}: ${title}`}>⋯</summary>
        <div><label>{k.moveTo}<select value={task.status} onChange={event => move(event.target.value as Status)}>{statuses.map(status => <option key={status} value={status}>{k.columns[status]}</option>)}</select></label>
          <div className="kb-move-buttons"><button disabled={first} onClick={() => reorder(-1)}>{c.up} ↑</button><button disabled={last} onClick={() => reorder(1)}>{c.down} ↓</button></div>
        </div>
      </details>
    </div>
  </article>;
}
