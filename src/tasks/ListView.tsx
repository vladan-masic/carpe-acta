import { useRef, type RefObject } from 'react';
import type { Locale } from '../i18n/locales';
import { statuses, type Task } from './domain';
import { taskCopy } from './presentation/copy';
import { kanbanCopy } from './presentation/boardCopy';
import { OrderControls } from './presentation/TaskControls';
import { taskInteractive, type useBoardDrag } from './presentation/useBoardDrag';

type Props = {
 tasks: Task[]; locale: Locale; selected: string|null; manual: boolean;
 open: (id:string,button:HTMLButtonElement)=>void;
 reorder: (task:Task,direction:number)=>void; complete:(id:string,done:boolean)=>void;
 container: RefObject<HTMLDivElement|null>; dragging: ReturnType<typeof useBoardDrag>;
};
export function ListView(props: Props) {
 const {tasks,manual,container}=props;
 const list=(items:Task[])=><ul className="tasks-list production-list">{items.map(task=><ListRow key={task.id} {...props} task={task}/>)}</ul>;
 return <div ref={container} className="task-list-groups" data-drag-layout="list">
  {manual?statuses.map(status=>{const peers=tasks.filter(task=>task.status===status);return peers.length>0&&<div key={status} data-column={status}>{list(peers)}</div>;}):list(tasks)}
 </div>;
}
function ListRow({task,tasks,locale,selected,manual,open,reorder,complete,dragging}:Props & {task:Task}) {
 const c=taskCopy[locale],k=kanbanCopy[locale],titleButton=useRef<HTMLButtonElement>(null);
 const peers=tasks.filter(t=>t.status===task.status),index=peers.findIndex(t=>t.id===task.id),drag=dragging.drag;
 const before=drag?.target?.beforeId===task.id;
 const end=drag?.target?.status===task.status && drag.target.beforeId===null && index===peers.length-1;
 return <li data-card-id={task.id} data-selected={selected===task.id} data-complete={task.status==='done'} data-draggable={manual}
 data-dragging={drag?.id===task.id} data-insert={before} data-insert-end={end} {...(manual?dragging.surface(task.id):{})}
 onClick={event=>{if(!(event.target as Element).closest(taskInteractive)&&titleButton.current)open(task.id,titleButton.current);}}>
 {manual?<OrderControls id={task.id} handle={dragging.handle(task.id)} label={task.title} first={index===0} last={index===peers.length-1} copy={c} move={n=>reorder(task,n)}/>:<span/>}
 <label className="task-checkbox-touch"><input type="checkbox" checked={task.status==='done'} aria-label={`${task.status==='done'?c.reopen:c.complete}: ${task.title}`} onChange={e=>complete(task.id,e.target.checked)}/></label>
 <div className="tasks-row-main"><button ref={titleButton} className="tasks-row-title-button" onClick={e=>open(task.id,e.currentTarget)} aria-label={`${c.open}: ${task.title}`}><span className="tasks-row-title">{task.title}</span></button>
 <span className="tasks-row-meta"><span>{k.columns[task.status]}</span><span className="tasks-stars" aria-label={`${c.difficulty}: ${task.difficulty}`}>{'★'.repeat(task.difficulty)}{'☆'.repeat(5-task.difficulty)}</span><span className="tasks-badge" data-urgency={task.urgency}>{c.urgencies[task.urgency]}</span>{task.deadline&&<span>{new Intl.DateTimeFormat(locale==='en'?'en-GB':'sr-Latn',{month:'short',day:'numeric'}).format(new Date(`${task.deadline}T12:00:00`))}</span>}{task.subtasks.length>0&&<span>{c.progress(task.subtasks.filter(s=>s.completedAt).length,task.subtasks.length)}</span>}</span></div>
 </li>;
}
