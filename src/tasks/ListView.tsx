import type { Locale } from '../i18n/locales';
import type { Task } from './domain';
import { taskCopy } from './presentation/copy';
import { kanbanCopy } from './presentation/boardCopy';
import { OrderControls } from './presentation/TaskControls';
export function ListView({tasks,locale,selected,manual,open,reorder,complete}:{tasks:Task[];locale:Locale;selected:string|null;manual:boolean;open:(id:string,button:HTMLButtonElement)=>void;reorder:(task:Task,direction:number)=>void;complete:(id:string,done:boolean)=>void}) {
 const c=taskCopy[locale],k=kanbanCopy[locale];
 return <ul className="tasks-list production-list">{tasks.map(task=>{
 const peers=tasks.filter(t=>t.status===task.status),index=peers.findIndex(t=>t.id===task.id);
 return <li key={task.id} data-selected={selected===task.id} data-complete={task.status==='done'}>
 {manual?<OrderControls label={task.title} first={index===0} last={index===peers.length-1} copy={c} move={n=>reorder(task,n)}/>:<span/>}
 <label className="task-checkbox-touch"><input type="checkbox" checked={task.status==='done'} aria-label={`${task.status==='done'?c.reopen:c.complete}: ${task.title}`} onChange={e=>complete(task.id,e.target.checked)}/></label>
 <button className="tasks-row-main" onClick={e=>open(task.id,e.currentTarget)} aria-label={`${c.open}: ${task.title}`}><span className="tasks-row-title">{task.title}</span><span className="tasks-row-meta"><span>{k.columns[task.status]}</span><span className="tasks-stars" aria-label={`${c.difficulty}: ${task.difficulty}`}>{'★'.repeat(task.difficulty)}{'☆'.repeat(5-task.difficulty)}</span><span className="tasks-badge" data-urgency={task.urgency}>{c.urgencies[task.urgency]}</span>{task.deadline&&<span>{new Intl.DateTimeFormat(locale==='en'?'en-GB':'sr-Latn',{month:'short',day:'numeric'}).format(new Date(`${task.deadline}T12:00:00`))}</span>}{task.subtasks.length>0&&<span>{c.progress(task.subtasks.filter(s=>s.completedAt).length,task.subtasks.length)}</span>}</span></button>
 </li>})}</ul>;
}
