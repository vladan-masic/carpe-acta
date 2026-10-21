import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppToolbar } from '../components/AppToolbar';
import { AppFooter } from '../components/AppFooter';
import { LanguageSelector } from '../components/LanguageSelector';
import { getInitialLocale, persistLocale, type Locale } from '../i18n/locales';
import { messages } from '../i18n/messages';
import { TaskDetail } from './presentation/TaskDetail';
import { Properties } from './presentation/TaskControls';
import { taskCopy } from './presentation/copy';
import { bilingual, dateKey, type View } from './presentation/model';
import { BoardCard } from './presentation/BoardCard';
import { eligibleGuestTasks, completeTask, newTask as createTask, moveTask, statuses, visibleTasks, type Task, type Status, type Sort } from './domain';
import type { BoardTask } from './presentation/boardModel';
import { kanbanCopy } from './presentation/boardCopy';
import { useBoardDrag } from './presentation/useBoardDrag';
import landscape from '../assets/illustrations/hero-path-1200.webp';
import notebook from '../assets/illustrations/action-notebook.webp';
import './presentation/tasks.css';
import './presentation/kanban.css';
import './production.css';
import { ThemeSelector } from '../components/ThemeSelector';
import { AuthPanel } from '../components/AuthPanel';
import { useAuth } from '../hooks/useAuth';
import { TaskStore } from './store';
import { accountAdapter, guestAdapter, readGuest, GUEST_KEY } from './persistence';
import { persistenceCopy } from './copy';
import { toEditor, fromEditor } from './viewAdapter';
import { ListView } from './ListView';

export function TasksPage() {
 const auth=useAuth();
 const [locale,setLocale]=useState(getInitialLocale);
 const stores=useRef(new Map<string,TaskStore>());
 const owner=auth.session?.user.id??null;
 const key=owner??'guest';
 let store=stores.current.get(key);
 if(!store && !auth.loading && (!owner || auth.client)) { store=new TaskStore(owner,owner && auth.client?accountAdapter(auth.client,owner):guestAdapter()); stores.current.set(key,store); }
 const toolbar=<AppToolbar label={taskCopy[locale].menu} navigation={<nav className="section-navigation" aria-label={taskCopy[locale].menu}><a href="/">⌂ {taskCopy[locale].home}</a><a href="/tasks" aria-current="page">☷ {taskCopy[locale].title}</a></nav>}><ThemeSelector locale={locale}/><LanguageSelector ariaLabel={taskCopy[locale].language} locale={locale} onSelectLocale={setLocale}/><AuthPanel locale={locale} auth={auth}/></AppToolbar>;
 useEffect(()=>{
   const guard=(event:BeforeUnloadEvent)=>{if([...stores.current.values()].some(s=>s.getSnapshot().dirty)){event.preventDefault();event.returnValue='';}};
   window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);
 },[]);
 const otherDrafts=[...stores.current.entries()].some(([scope,s])=>scope!==key&&s.getSnapshot().dirty);
 useEffect(()=>{persistLocale(locale);document.documentElement.lang=locale;document.title=`${taskCopy[locale].title} · Carpe Acta`;},[locale]);
 return auth.loading || !store?<div className="tasks-preview kb-preview tasks-production"><div className="kb-shell">{toolbar}<p role="status">{persistenceCopy[locale].loading}</p></div></div>:<TasksWorkspace key={key} store={store} locale={locale} toolbar={toolbar} otherDrafts={otherDrafts}/>;
}


const icons: Record<Status, string> = { later: '⚑', next: '☀', doing: '◷', done: '✓' };
const newTask = (): BoardTask => ({
  id: '', title: bilingual('', ''), notes: bilingual('', ''), difficulty: 1,
  urgency: 0, importance: 1, deadline: '', minutes: '', done: false, subtasks: [], status: 'next',
});

function TasksWorkspace({store,locale,toolbar,otherDrafts}:{store:TaskStore;locale:Locale;toolbar:React.ReactNode;otherDrafts:boolean}) {
  const state=useSyncExternalStore(store.subscribe,store.getSnapshot);
  const tasks=state.tasks;
  const setTasks=(update:(tasks:Task[])=>Task[])=>store.edit(update);
  const [selected,setSelected]=useState<string|null>(null);
  const [mode,setMode]=useState<'board'|'list'>(()=>{try{return localStorage.getItem('carpe-acta.tasks.view')==='list'?'list':'board';}catch{return 'board';}});
  const [sort,setSort]=useState<Sort>('manual');
  const [deleteRequested,setDeleteRequested]=useState(false);
  const [importMessage,setImportMessage]=useState<string[]|'error'|null>(null);
  const [canImport,setCanImport]=useState(false);
  const deleteDialog=useRef<HTMLDialogElement>(null);
  const p=persistenceCopy[locale];
  useEffect(()=>store.connect(),[store]);
  useEffect(()=>{
    const check=()=>{
      try { setCanImport(Boolean(store.owner && state.ready && eligibleGuestTasks(readGuest(),state).length)); }
      catch { setCanImport(false); }
    };
    const onStorage=(event:StorageEvent)=>{if(event.key===GUEST_KEY || event.key===null)check();};
    check();
    window.addEventListener('storage',onStorage);
    window.addEventListener('focus',check);
    document.addEventListener('visibilitychange',check);
    return ()=>{window.removeEventListener('storage',onStorage);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
  },[store,state]);
  useEffect(()=>{try{localStorage.setItem('carpe-acta.tasks.view',mode);}catch{/* The view still switches in memory. */}},[mode]);
  useEffect(()=>{if(deleteRequested)deleteDialog.current?.showModal();},[deleteRequested]);
  function download() { const raw=state.error==='corrupt'&&!store.owner?localStorage.getItem(GUEST_KEY):null;const blob=new Blob([raw??JSON.stringify({version:1,snapshot:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='carpe-acta-tasks-recovery.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }

  const [view, setView] = useState<View>('all');
  const [draft, setDraft] = useState(newTask);
  const [title, setTitle] = useState('');
  const [detailsOpen,setDetailsOpen]=useState(false);
  const [addStatus, setAddStatus] = useState<Status>('next');
  const [visibleColumn, setVisibleColumn] = useState<Status>('later');
  const [announcement, announce] = useState('');
  const quickInput = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const c = {...taskCopy[locale],focusCopy:p.focusCopy,finish:p.finish,saved:p.pending}, k = kanbanCopy[locale];
  const selectedRecord=tasks.find(task=>task.id===selected);
  const selectedTask=selectedRecord?toEditor(selectedRecord):undefined;
  const visibleRecords=visibleTasks(tasks,view,sort,dateKey());
  const visible=visibleRecords.map(toEditor);
  const canOrder=view==='all' && sort==='manual';

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
  const dragging = useBoardDrag(board, move, announce, k, {enabled:canOrder && state.ready && state.error!=='conflict',scope:mode});
  const { drag, handle, surface } = dragging;
  const draggedTask = visible.find(task => task.id === drag?.id);

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
  function reorder(task: {id:string;status:Status}, direction: number) {
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

  return <div className="tasks-preview kb-preview tasks-production" data-detail-open={Boolean(selectedTask)}>
    <div className="kb-shell" id="page-top" tabIndex={-1}>
      {toolbar}
      <main>
        <section className="task-storage" aria-label={store.owner?p.accountLabel:p.guestLabel}>
         <span className="task-storage-type" title={store.owner?p.account:p.guest}>{store.owner?p.accountLabel:p.guestLabel}</span>
         <div className="task-storage-status" role="status">{state.saving?p.saving:state.dirty?p.pending:state.error?p.unavailable:!state.ready?p.loading:p.saved}</div>
         <div className="task-storage-actions">
          <button disabled={state.saving || state.dirty} onClick={()=>void store.refresh()}>{state.ready?p.refresh:p.retryLoad}</button>
          {state.dirty&&state.error!=='conflict'&&<button disabled={state.saving} onClick={()=>void store.flush()}>{p.retry}</button>}
          {(state.dirty || state.error)&&<button onClick={download}>{p.export}</button>}
          {state.error==='conflict'&&<button onClick={()=>{if(window.confirm(p.discard))void store.reloadServer();}}>{p.reload}</button>}
          {canImport&&<button disabled={state.saving || !!state.error} title={p.importHint} onClick={()=>{try{const guest=readGuest();const added=eligibleGuestTasks(guest,state);store.importGuest(guest);setImportMessage(added.length?added.map(task=>task.id):null);setCanImport(eligibleGuestTasks(guest,store.getSnapshot()).length>0);}catch{setImportMessage('error');}}}>{p.import}</button>}
         </div>
         {otherDrafts&&<p role="alert">{p.otherDrafts}</p>}
         {state.error&&<p role="alert">{p.error[state.error]}</p>}
         <div className="task-import-feedback" role="status" aria-live="polite">{importMessage==='error'?p.error.storage:Array.isArray(importMessage)&&importMessage.every(id=>state.importedIds.includes(id))&&!state.error?(state.dirty||state.saving?p.importPending:p.importSuccess):''}</div>
        </section>
        <header className="kb-hero">
          <div className="kb-hero-copy"><h1>{k.title}</h1><p className="kb-promise">{k.lead} <em>{k.accent}</em></p><p>{k.description}</p></div>
          <div className="kb-art" aria-hidden="true"><img src={landscape} alt=""/><img src={notebook} alt=""/></div>
          <p className="kb-annotation">{k.annotation} <span aria-hidden="true">♥</span></p>
        </header>
        <div className="kb-layout" data-panel={Boolean(selectedTask)}>
          <section className="kb-board-area" aria-label={mode==='board'?p.board:p.list}>
            <div className="task-view-switch" role="group" aria-label={p.view}><button aria-pressed={mode==='board'} onClick={()=>setMode('board')}>{p.board}</button><button aria-pressed={mode==='list'} onClick={()=>setMode('list')}>{p.list}</button><label>{c.sort}<select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="manual">{c.manual}</option><option value="deadline">{c.byDate}</option></select></label></div>
            <fieldset className="task-content" disabled={!state.ready || state.error==='conflict'}>
            <div className="kb-entry">
              <form className="kb-quick" onSubmit={event => {
                event.preventDefault();
                if (!title.trim()) { announce(c.blank); return; }
                const task=createTask(title,store.owner,addStatus,tasks);
                setTasks(items => fromEditor([...items,task],task.id,{notes:draft.notes,difficulty:draft.difficulty,urgency:draft.urgency,importance:draft.importance,deadline:draft.deadline,minutes:draft.minutes},locale));
                setTitle(''); setDraft(newTask()); setView('all'); announce(`${c.added} ${k.columns[addStatus]}.`);
                navigateColumn(addStatus); quickInput.current?.focus();
              }}>
                <div className="kb-quick-row"><span className="task-add-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><input ref={quickInput} value={title} onChange={event => setTitle(event.target.value)} maxLength={200} aria-label={c.placeholder} placeholder={c.placeholder}/><button className="tasks-primary" type="submit" disabled={tasks.length>=1000}>{c.add}</button></div>
                <div className="kb-quick-options"><label>{k.addTo}<select value={addStatus} onChange={event => setAddStatus(event.target.value as Status)}>{statuses.map(status => <option key={status} value={status}>{k.columns[status]}</option>)}</select></label>
                  <button type="button" className="task-advanced-toggle" aria-expanded={detailsOpen} aria-controls="task-advanced-fields" onClick={()=>setDetailsOpen(value=>!value)}><span aria-hidden="true">{detailsOpen?'▾':'▸'}</span> {c.advanced}</button>
                </div>
                <div id="task-advanced-fields" hidden={!detailsOpen}><Properties task={draft} update={patch => setDraft(task => ({ ...task, ...patch }))} copy={c}/><label>{c.notes}<textarea maxLength={10000} value={draft.notes[locale]} onChange={event => setDraft(task => ({ ...task, notes: bilingual(event.target.value, event.target.value) }))}/></label></div>
              </form>
              <div className="kb-filters" role="group" aria-label={k.filter}>{(['all', 'today', 'upcoming', 'someday', 'completed'] as View[]).map(filter => <button key={filter} aria-pressed={view === filter} onClick={() => setView(filter)}>{filter === 'all' ? k.all : c[filter]}</button>)}</div>
            </div>
            <p className="kb-filter-help">{k.explanation}</p>
            {mode==='board'&&<><nav className="kb-column-nav" aria-label={k.moveTo}>{statuses.map(status => <button key={status} aria-pressed={visibleColumn === status} onClick={() => navigateColumn(status)}>{icons[status]} {k.columns[status]} <span>{visible.filter(task => task.status === status).length}</span></button>)}</nav>
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
                    {cards.map((task, index) => <BoardCard key={task.id} task={task} locale={locale} selected={task.id === selected} dragging={drag?.id === task.id} before={drag?.target?.beforeId === task.id} first={!canOrder || index === 0} last={!canOrder || index === cards.length - 1} handle={canOrder?handle(task.id):undefined} surface={canOrder?surface(task.id):undefined}
                      open={button => open(task.id, button)} move={target => move(task.id, target)} reorder={direction => reorder(task, direction)}
                      complete={done => setTasks(items=>completeTask(items,task.id,done))}/>) }
                    {cards.length === 0 && <p className="kb-empty">{view === 'all' ? k.noCards : k.noMatches}</p>}
                    <div className="kb-drop-end" data-active={drag?.target?.status === status && drag.target.beforeId === null}>{drag?.target?.status === status && drag.target.beforeId === null ? k.dropped : ''}</div>
                  </div>
                  <button className="kb-add-column" onClick={() => addToColumn(status)} aria-label={`${c.add}: ${k.columns[status]}`}>＋ {c.add}</button>
                  <p className="kb-column-note">{k.notes[status]} <span aria-hidden="true">♥</span></p>
                </section>;
              })}
            </div>
            <p className="kb-drag-help" id="kb-drag-help">{canOrder?k.dragHint:p.order}</p></>}
            {mode==='list'&&<><ListView container={board} dragging={dragging} tasks={visibleRecords} locale={locale} selected={selected} manual={canOrder} open={open} reorder={reorder} complete={(id,done)=>setTasks(items=>completeTask(items,id,done))}/>{!visible.length&&<div className="tasks-empty"><h2>{c.empty}</h2><p>{c.emptyCopy}</p></div>}<p className="kb-drag-help" id="kb-drag-help">{p.order} {k.dragHint}</p></>}
            </fieldset>
          </section>
          {selectedTask && <aside className="kb-detail-wrap" aria-label={c.details}>
            <TaskDetail expanded key={selectedTask.id} task={selectedTask} locale={locale} copy={c} update={patch => setTasks(items => fromEditor(items, selectedTask.id, patch,locale))} close={close} announce={announce}/>
            <div className="kb-detail-tools"><label>{k.status}<select value={selectedTask.status} onChange={event => move(selectedTask.id, event.target.value as Status, null, false)}>{statuses.map(status => <option key={status} value={status}>{k.columns[status]}</option>)}</select></label>
              <button onClick={()=>setDeleteRequested(true)}>{k.delete}</button>
            </div>
          </aside>}
        </div>
        <p className="tasks-live" role="status">{announcement}</p>
        {deleteRequested&&<dialog ref={deleteDialog} onCancel={()=>setDeleteRequested(false)} onClose={()=>setDeleteRequested(false)}><h2>{p.delete}</h2><button autoFocus onClick={()=>{deleteDialog.current?.close();}}>{p.cancel}</button><button onClick={()=>{setTasks(items=>items.filter(task=>task.id!==selected));deleteDialog.current?.close();close();}}>{p.confirm}</button></dialog>}
      </main>
    </div>
    <AppFooter locale={locale} createdByLabel={messages[locale].footer.createdBy} motto={messages[locale].footer.motto}/>
    {drag && draggedTask && <div className="kb-drag-ghost" aria-hidden="true" style={{ width: drag.width, minHeight: drag.height, transform: `translate3d(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px, 0) rotate(2deg)` }}><strong>{draggedTask.title[locale]}</strong><span className="tasks-stars">{'★'.repeat(draggedTask.difficulty)}{'☆'.repeat(5 - draggedTask.difficulty)}</span><p>{drag.target ? k.columns[drag.target.status] : k.cancelDrag}</p></div>}
  </div>;
}
