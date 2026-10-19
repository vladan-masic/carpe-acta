import { useEffect, useRef, useState } from 'react';
import { AppToolbar } from '../../components/AppToolbar';
import { AppFooter } from '../../components/AppFooter';
import { LanguageSelector } from '../../components/LanguageSelector';
import { getInitialLocale } from '../../i18n/locales';
import { messages } from '../../i18n/messages';
import { TaskDetail } from '../tasks/TaskDetail';
import { Properties } from '../tasks/TaskControls';
import { taskCopy } from '../tasks/copy';
import { bilingual, filterTasks, type Task, type View } from '../tasks/model';
import { BoardCard } from './BoardCard';
import { boardSamples, moveTask, patchTask, statuses, type BoardTask, type Status } from './model';
import { kanbanCopy } from './copy';
import { useBoardDrag } from './useBoardDrag';
import landscape from '../../assets/illustrations/hero-path-1200.webp';
import notebook from '../../assets/illustrations/action-notebook.webp';
import '../tasks/tasks.css';
import './kanban.css';

const icons: Record<Status, string> = { later: '⚑', next: '☀', doing: '◷', done: '✓' };
const newTask = (): BoardTask => ({
  id: '', title: bilingual('', ''), notes: bilingual('', ''), difficulty: 1,
  urgency: 0, importance: 1, deadline: '', minutes: '', done: false, subtasks: [], status: 'next',
});

export function KanbanPreview() {
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [tasks, setTasks] = useState(boardSamples);
  const [selected, setSelected] = useState<string | null>(() => window.matchMedia?.('(min-width: 1100px)').matches ? 'sample-0' : null);
  const [view, setView] = useState<View>('all');
  const [draft, setDraft] = useState(newTask);
  const [title, setTitle] = useState('');
  const [addStatus, setAddStatus] = useState<Status>('next');
  const [visibleColumn, setVisibleColumn] = useState<Status>('later');
  const [announcement, announce] = useState('');
  const [deleted, setDeleted] = useState<{ task: BoardTask; beforeId: string | null } | null>(null);
  const quickInput = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const c = taskCopy[locale], k = kanbanCopy[locale];
  const selectedTask = tasks.find(task => task.id === selected);
  const visibleIds = new Set(filterTasks(tasks, view).map(task => task.id));
  const visible = tasks.filter(task => visibleIds.has(task.id));

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = `${c.title} · ${k.board} · Carpe Acta`;
  }, [locale, c.title, k.board]);

  function move(id: string, status: Status, beforeId: string | null = null, restoreFocus = true) {
    setTasks(items => moveTask(items, id, status, beforeId));
    announce(`${k.moved}: ${k.columns[status]}.`);
    if (!restoreFocus) return;
    requestAnimationFrame(() => {
      const handle = [...(board.current?.querySelectorAll<HTMLButtonElement>('[data-handle-id]') ?? [])].find(element => element.dataset.handleId === id);
      if (handle) {
        handle.focus({ preventScroll: true });
        handle.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      else quickInput.current?.focus({ preventScroll: true });
    });
  }
  const { drag, handle } = useBoardDrag(board, move, announce, k);
  const draggedTask = tasks.find(task => task.id === drag?.id);

  function open(id: string, button: HTMLButtonElement) {
    opener.current = button;
    setSelected(id);
    requestAnimationFrame(() => document.getElementById('task-detail-heading')?.focus());
  }
  function close() {
    setSelected(null);
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus();
      else quickInput.current?.focus();
    });
  }
  function navigateColumn(status: Status) {
    const column = board.current?.querySelector<HTMLElement>(`[data-column="${status}"]`);
    if (column && board.current) board.current.scrollTo({ left: column.offsetLeft - board.current.offsetLeft, behavior: 'smooth' });
    setVisibleColumn(status);
  }
  function reorder(task: BoardTask, direction: number) {
    const peers = visible.filter(item => item.status === task.status);
    const index = peers.findIndex(item => item.id === task.id);
    const destination = index + direction;
    if (destination < 0 || destination >= peers.length) return;
    const beforeId = direction < 0 ? peers[destination].id : peers[destination + 1]?.id ?? null;
    move(task.id, task.status, beforeId);
  }
  function addToColumn(status: Status) {
    setAddStatus(status);
    quickInput.current?.focus();
    quickInput.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  return <div className="tasks-preview kb-preview" data-detail-open={Boolean(selectedTask)}>
    <div className="kb-shell" id="page-top" tabIndex={-1}>
      <AppToolbar label={c.menu} navigation={<nav className="section-navigation" aria-label={c.menu}>
        <a href="/">⌂ {c.home}</a><a href="/__tasks-kanban-preview" aria-current="page">☷ {c.title}</a><a href="/__tasks-preview">{k.list} ↗</a>
      </nav>}>
        <label className="tasks-theme">{c.theme}<select aria-label={c.theme} value={theme} onChange={event => setTheme(event.target.value)}><option value="light">{c.light}</option><option value="dark">{c.dark}</option></select></label>
        <LanguageSelector ariaLabel={c.language} locale={locale} onSelectLocale={setLocale}/>
      </AppToolbar>
      <main>
        <header className="kb-hero">
          <div className="kb-hero-copy"><h1>{k.title}</h1><p className="kb-promise">{k.lead} <em>{k.accent}</em></p><p>{k.description}</p></div>
          <div className="kb-art" aria-hidden="true"><img src={landscape} alt=""/><img src={notebook} alt=""/></div>
          <p className="kb-annotation">{k.annotation} <span aria-hidden="true">♥</span></p>
        </header>
        <div className="kb-layout" data-panel={Boolean(selectedTask)}>
          <section className="kb-board-area" aria-label={k.board}>
            <div className="kb-entry">
              <form className="kb-quick" onSubmit={event => {
                event.preventDefault();
                if (!title.trim()) { announce(c.blank); return; }
                const id = crypto.randomUUID();
                setTasks(items => [...items, { ...draft, id, title: bilingual(title.trim(), title.trim()), status: addStatus, done: addStatus === 'done' }]);
                setTitle(''); setDraft(newTask()); setView('all'); announce(`${c.added} ${k.columns[addStatus]}.`);
                navigateColumn(addStatus); quickInput.current?.focus();
              }}>
                <div className="kb-quick-row"><span aria-hidden="true">＋</span><input ref={quickInput} value={title} onChange={event => setTitle(event.target.value)} maxLength={200} aria-label={c.placeholder} placeholder={c.placeholder}/><button className="tasks-primary" type="submit">{c.add}</button></div>
                <div className="kb-quick-options"><label>{k.addTo}<select value={addStatus} onChange={event => setAddStatus(event.target.value as Status)}>{statuses.map(status => <option key={status} value={status}>{k.columns[status]}</option>)}</select></label>
                  <details><summary>{c.advanced}</summary><Properties task={draft} update={patch => setDraft(task => ({ ...task, ...patch }))} copy={c}/><label>{c.notes}<textarea value={draft.notes[locale]} onChange={event => setDraft(task => ({ ...task, notes: bilingual(event.target.value, event.target.value) }))}/></label></details>
                </div>
              </form>
              <div className="kb-filters" role="group" aria-label={k.filter}>{(['all', 'today', 'upcoming', 'someday', 'completed'] as View[]).map(filter => <button key={filter} aria-pressed={view === filter} onClick={() => setView(filter)}>{filter === 'all' ? k.all : c[filter]}</button>)}</div>
            </div>
            <p className="kb-filter-help">{k.explanation}</p>
            <nav className="kb-column-nav" aria-label={k.moveTo}>{statuses.map(status => <button key={status} aria-pressed={visibleColumn === status} onClick={() => navigateColumn(status)}>{icons[status]} {k.columns[status]} <span>{visible.filter(task => task.status === status).length}</span></button>)}</nav>
            <div className="kb-board" data-drag-active={Boolean(drag)} ref={board} onScroll={() => {
              if (!board.current) return;
              const left = board.current.getBoundingClientRect().left;
              const columns = [...board.current.querySelectorAll<HTMLElement>('[data-column]')];
              const nearest = columns.sort((a, b) => Math.abs(a.getBoundingClientRect().left - left) - Math.abs(b.getBoundingClientRect().left - left))[0];
              if (nearest) setVisibleColumn(nearest.dataset.column as Status);
            }}>
              {statuses.map(status => {
                const cards = visible.filter(task => task.status === status);
                return <section key={status} className="kb-column" data-column={status} data-target={drag?.target?.status === status} aria-labelledby={`column-${status}`}>
                  <header className="kb-column-heading"><span className="kb-status-icon" aria-hidden="true">{icons[status]}</span><div><h2 id={`column-${status}`}>{k.columns[status]} <span>{cards.length}</span></h2><p>{k.hints[status]}</p></div></header>
                  <div className="kb-cards">
                    {cards.map((task, index) => <BoardCard key={task.id} task={task} locale={locale} selected={task.id === selected} dragging={drag?.id === task.id} before={drag?.target?.beforeId === task.id} first={index === 0} last={index === cards.length - 1} handle={handle(task.id)}
                      open={button => open(task.id, button)} move={target => move(task.id, target)} reorder={direction => reorder(task, direction)}
                      complete={done => move(task.id, done ? 'done' : 'next')}/>) }
                    {cards.length === 0 && <p className="kb-empty">{view === 'all' ? k.noCards : k.noMatches}</p>}
                    <div className="kb-drop-end" data-active={drag?.target?.status === status && drag.target.beforeId === null}>{drag?.target?.status === status && drag.target.beforeId === null ? k.dropped : ''}</div>
                  </div>
                  <button className="kb-add-column" onClick={() => addToColumn(status)} aria-label={`${c.add}: ${k.columns[status]}`}>＋ {c.add}</button>
                  <p className="kb-column-note">{k.notes[status]} <span aria-hidden="true">♥</span></p>
                </section>;
              })}
            </div>
            <p className="kb-drag-help" id="kb-drag-help">{k.dragHint}</p>
          </section>
          {selectedTask && <aside className="kb-detail-wrap" aria-label={c.details}>
            <TaskDetail expanded key={selectedTask.id} task={selectedTask} locale={locale} copy={c} update={patch => setTasks(items => patchTask(items, selectedTask.id, patch))} close={close} announce={announce}/>
            <div className="kb-detail-tools"><label>{k.status}<select value={selectedTask.status} onChange={event => move(selectedTask.id, event.target.value as Status, null, false)}>{statuses.map(status => <option key={status} value={status}>{k.columns[status]}</option>)}</select></label>
              <button onClick={() => {
                const peers = tasks.filter(task => task.status === selectedTask.status);
                setDeleted({ task: selectedTask, beforeId: peers[peers.findIndex(task => task.id === selectedTask.id) + 1]?.id ?? null });
                setTasks(items => items.filter(task => task.id !== selectedTask.id)); close(); announce(k.deleted);
              }}>{k.delete}</button>
            </div>
          </aside>}
        </div>
        <div className="tasks-preview-bar"><span>{c.preview}</span><div><button onClick={() => { setTasks(boardSamples()); setSelected(null); setDeleted(null); setView('all'); announce(''); }}>{k.reset}</button><a href="/__tasks-preview">{k.list} ↗</a></div></div>
        <div className="kb-feedback"><p role="status" aria-live="polite">{announcement}</p>{deleted && <button onClick={() => {
          setTasks(items => moveTask([...items, deleted.task], deleted.task.id, deleted.task.status, deleted.beforeId));
          setDeleted(null); announce(c.saved);
        }}>{k.undo}</button>}</div>
      </main>
    </div>
    <AppFooter locale={locale} createdByLabel={messages[locale].footer.createdBy} motto={messages[locale].footer.motto}/>
    {drag && draggedTask && <div className="kb-drag-ghost" aria-hidden="true" style={{ width: drag.width, minHeight: drag.height, transform: `translate3d(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px, 0) rotate(2deg)` }}><strong>{draggedTask.title[locale]}</strong><span className="tasks-stars">{'★'.repeat(draggedTask.difficulty)}{'☆'.repeat(5 - draggedTask.difficulty)}</span><p>{drag.target ? k.columns[drag.target.status] : k.cancelDrag}</p></div>}
  </div>;
}
