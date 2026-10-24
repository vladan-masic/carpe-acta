import { TaskSupport, type SupportMode } from './TaskSupport';
import { TaskIcon } from './TaskIcon';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AutoGrowTextarea } from './AutoGrowTextarea';
import { useSubtaskDrag } from './useSubtaskDrag';
import type { Locale } from '../../i18n/locales';
import type { TaskCopy } from './copy';
import { bilingual, moveItem, type Task } from './model';
import { OrderControls, Properties } from './TaskControls';
type Props = {expanded?:boolean;supportEnabled?:boolean;focusRequest?:number;dragEnabled?:boolean;startRequested?:boolean;task:Task;locale:Locale;copy:TaskCopy;update:(patch:Partial<Task>)=>void;close:()=>void;announce:(s:string)=>void};
export function TaskDetail({expanded=false,dragEnabled=true,supportEnabled=dragEnabled,focusRequest=0,startRequested=false,task,locale,copy:c,update,close,announce}:Props) {
 const [tab,setTab]=useState<'subtasks'|'details'>('subtasks');
 const [action,setAction]=useState<SupportMode|null>(startRequested?'start':null);
 useEffect(()=>{if(focusRequest)setAction('start');},[focusRequest]);
 const actionOpener=useRef<HTMLButtonElement|null>(null);
 const openSupport=(mode:SupportMode,button:HTMLButtonElement)=>{actionOpener.current=button;setAction(mode);};
 const closeSupport=()=>{setAction(null);requestAnimationFrame(()=>(actionOpener.current?.isConnected?actionOpener.current:document.querySelector<HTMLElement>('[data-focus-open]'))?.focus());};
 const [step,setStep]=useState('');
 const stepInput=useRef<HTMLInputElement>(null);
 const done=task.subtasks.filter(s=>s.done).length;
 const subtaskList=useRef<HTMLUListElement>(null);
 const {drag,handle}=useSubtaskDrag(subtaskList,(id,beforeId)=>{
  const item=task.subtasks.find(sub=>sub.id===id);if(!item)return;
  const ordered=task.subtasks.filter(sub=>sub.id!==id);
  const index=beforeId===null?ordered.length:ordered.findIndex(sub=>sub.id===beforeId);
  if(index<0)return;
  ordered.splice(index,0,item);
  if(ordered.some((sub,i)=>sub.id!==task.subtasks[i].id))update({subtasks:ordered});
  announce(`${item.title[locale]}. ${c.moved} ${index+1} / ${ordered.length}.`);
  requestAnimationFrame(()=>{[...subtaskList.current?.querySelectorAll<HTMLElement>('[data-handle-id]')??[]].find(element=>element.dataset.handleId===id)?.focus({preventScroll:true});});
 },announce,{picked:c.stepPicked,cancelDrag:c.stepCancelled},dragEnabled,task.id);
 const draggedSubtask=task.subtasks.find(sub=>sub.id===drag?.id);
 return <section className="tasks-detail" aria-label={`${c.details}: ${task.title[locale]}`} onKeyDown={e=>{if(e.key==='Escape' && !(e.target instanceof Element&&e.target.closest('dialog')) && !e.defaultPrevented && !(e.target instanceof HTMLSelectElement) && !(e.target instanceof HTMLInputElement && e.target.type==='date')){e.preventDefault();close();}}}>
 <div className="tasks-detail-top"><span className="tasks-eyebrow">{c.details}</span><button type="button" className="tasks-text-button" onClick={close} aria-label={c.close}>← {c.close}</button></div>
 <h2 tabIndex={-1} id="task-detail-heading" aria-label={expanded ? task.title[locale] : undefined}>{expanded ? <AutoGrowTextarea maxLength={200} className="tasks-heading-input" aria-label={c.taskTitle} value={task.title[locale]} onChange={e=>update({title:{...task.title,[locale]:e.target.value}})} onBlur={()=>{if(!task.title[locale].trim())update({title:{...task.title,[locale]:c.newTask}});}}/> : task.title[locale]}</h2>
 {!expanded && task.notes[locale] && <p className="tasks-description">{task.notes[locale]}</p>}
 <div className="tasks-detail-meta"><span className="tasks-stars" aria-label={`${c.difficulty}: ${task.difficulty} — ${c.ratings[task.difficulty-1]}`}>{'★'.repeat(task.difficulty)}<span>{'☆'.repeat(5-task.difficulty)}</span></span><span className="tasks-badge" data-urgency={task.urgency}>{c.urgency}: {c.urgencies[task.urgency]}</span>{!expanded && task.minutes && <span>◷ {task.minutes} {c.minuteUnit}</span>}</div>
 {expanded && <div className="tasks-detail-facts">
 <span title={c.deadline}><TaskIcon name="today"/>{task.deadline ? new Intl.DateTimeFormat(locale==='en'?'en-GB':'sr-Latn',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${task.deadline}T12:00:00`)) : c.noDate}</span>
 {task.minutes && <span title={c.minutes}><TaskIcon name="upcoming"/>{task.minutes} {c.minuteUnit}</span>}
 <span title={c.subtasks}><TaskIcon name="subtasks"/>{done}/{task.subtasks.length} {c.subtasks.toLowerCase()}</span>
 </div>}
 {!expanded && <div className="tasks-detail-tabs" role="group" aria-label={c.details}><button aria-pressed={tab==='subtasks'} onClick={()=>setTab('subtasks')}>☷ {c.subtasks}</button><button aria-pressed={tab==='details'} onClick={()=>setTab('details')}>✎ {c.edit}</button></div>}
 {(expanded || tab==='details') && <div className="tasks-edit">{!expanded && <label>{c.taskTitle}<input maxLength={200} value={task.title[locale]} onChange={e=>update({title:{...task.title,[locale]:e.target.value}})} onBlur={()=>{if(!task.title[locale].trim())update({title:{...task.title,[locale]:c.newTask}});}} /></label>}<label>{c.notes}<textarea maxLength={10000} rows={expanded ? 2 : 3} value={task.notes[locale]} onChange={e=>update({notes:{...task.notes,[locale]:e.target.value}})} /></label><Properties task={task} update={update} copy={c}/><label className="tasks-completion"><input type="checkbox" checked={task.done} onChange={e=>update({done:e.target.checked})}/>{c.completed}</label></div>}
 {(expanded || tab==='subtasks') && <div className="tasks-subtasks">
 <div className="tasks-progress"><span>{c.progress(done,task.subtasks.length)}</span><progress value={done} max={task.subtasks.length||1} aria-label={c.subtasks}/></div>
 {!task.subtasks.length && <p className="tasks-muted">{c.none}</p>}
 <ul ref={subtaskList}>{task.subtasks.map((sub,i)=><li key={sub.id} data-subtask-id={sub.id} data-dragging={drag?.id===sub.id} data-insert={drag?.target?.beforeId===sub.id} data-insert-end={Boolean(drag?.target && drag.target.beforeId===null && i===task.subtasks.length-1)} data-done={sub.done}><OrderControls id={sub.id} handle={dragEnabled?handle(sub.id):undefined} label={sub.title[locale]} first={i===0} last={i===task.subtasks.length-1} copy={c} move={n=>{update({subtasks:moveItem(task.subtasks,sub.id,n)});announce(c.moved);}}/><label className="task-checkbox-touch"><input type="checkbox" aria-label={`${sub.done?c.reopen:c.complete}: ${sub.title[locale]}`} checked={sub.done} onChange={e=>update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,done:e.target.checked}:s)})}/></label><AutoGrowTextarea maxLength={200} className="tasks-step-title" aria-label={`${c.stepTitle} ${i+1}`} value={sub.title[locale]} onChange={e=>update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,title:{...s.title,[locale]:e.target.value}}:s)})} onBlur={()=>{if(!sub.title[locale].trim())update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,title:{...s.title,[locale]:c.addStep}}:s)});}}/><button className="tasks-icon-button" aria-label={`${c.remove}: ${sub.title[locale]}`} onClick={()=>{update({subtasks:task.subtasks.filter(s=>s.id!==sub.id)});stepInput.current?.focus();}}>×</button></li>)}</ul>
 <form className="tasks-add-step" onSubmit={e=>{e.preventDefault();if(!step.trim() || task.subtasks.length>=100)return;update({subtasks:[...task.subtasks,{id:crypto.randomUUID(),title:bilingual(step.trim(),step.trim()),done:false}]});setStep('');announce(c.stepAdded);stepInput.current?.focus();}}><input ref={stepInput} aria-label={c.addStep} placeholder={`${c.addStep}…`} value={step} onChange={e=>setStep(e.target.value)} maxLength={200}/><button type="submit" aria-label={c.addStep} disabled={!step.trim() || task.subtasks.length>=100}>＋</button></form>
 </div>}
 <div className="tasks-action-buttons"><button className="tasks-primary" onClick={e=>openSupport('start',e.currentTarget)}><TaskIcon name="start"/>{c.start}</button><button onClick={e=>openSupport('smaller',e.currentTarget)}><TaskIcon name="smaller"/>{c.smaller}</button><button onClick={e=>openSupport('stuck',e.currentTarget)}><TaskIcon name="stuck"/>{c.stuck}</button></div>
 <TaskSupport reveal={focusRequest} mode={action} task={task} locale={locale} enabled={supportEnabled} update={update} close={closeSupport} openStart={()=>setAction('start')} announce={announce}/>
 {drag&&draggedSubtask&&createPortal(<div className="tasks-subtask-ghost" aria-hidden="true" style={{width:drag.width,transform:`translate3d(${drag.x-drag.offsetX}px,${drag.y-drag.offsetY}px,0)`}}>{draggedSubtask.title[locale]}</div>,document.body)}
 </section>;
}
