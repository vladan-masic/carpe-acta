import { useRef, useState } from 'react';
import type { Locale } from '../../i18n/locales';
import type { TaskCopy } from './copy';
import { bilingual, moveItem, type Task } from './model';
import { OrderControls, Properties } from './TaskControls';
type Props = {expanded?:boolean;startRequested?:boolean;task:Task;locale:Locale;copy:TaskCopy;update:(patch:Partial<Task>)=>void;close:()=>void;announce:(s:string)=>void};
export function TaskDetail({expanded=false,startRequested=false,task,locale,copy:c,update,close,announce}:Props) {
 const [tab,setTab]=useState<'subtasks'|'details'>('subtasks');
 const [action,setAction]=useState<'start'|'smaller'|'stuck'|null>(startRequested?'start':null);
 const [barrier,setBarrier]=useState<number|null>(null);
 const [step,setStep]=useState('');
 const stepInput=useRef<HTMLInputElement>(null);
 const done=task.subtasks.filter(s=>s.done).length;
 return <section className="tasks-detail" aria-label={`${c.details}: ${task.title[locale]}`} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}}}>
 <div className="tasks-detail-top"><span className="tasks-eyebrow">{c.details}</span><button type="button" className="tasks-text-button" onClick={close} aria-label={c.close}>← {c.close}</button></div>
 <h2 tabIndex={-1} id="task-detail-heading" aria-label={expanded ? task.title[locale] : undefined}>{expanded ? <textarea maxLength={200} rows={2} className="tasks-heading-input" aria-label={c.taskTitle} value={task.title[locale]} onChange={e=>update({title:{...task.title,[locale]:e.target.value}})} onBlur={()=>{if(!task.title[locale].trim())update({title:{...task.title,[locale]:c.newTask}});}}/> : task.title[locale]}</h2>
 {!expanded && task.notes[locale] && <p className="tasks-description">{task.notes[locale]}</p>}
 <div className="tasks-detail-meta"><span className="tasks-stars" aria-label={`${c.difficulty}: ${task.difficulty} — ${c.ratings[task.difficulty-1]}`}>{'★'.repeat(task.difficulty)}<span>{'☆'.repeat(5-task.difficulty)}</span></span><span className="tasks-badge" data-urgency={task.urgency}>{c.urgency}: {c.urgencies[task.urgency]}</span>{task.minutes && <span>◷ {task.minutes} {c.minuteUnit}</span>}</div>
 {!expanded && <div className="tasks-detail-tabs" role="group" aria-label={c.details}><button aria-pressed={tab==='subtasks'} onClick={()=>setTab('subtasks')}>☷ {c.subtasks}</button><button aria-pressed={tab==='details'} onClick={()=>setTab('details')}>✎ {c.edit}</button></div>}
 {(expanded || tab==='details') && <div className="tasks-edit">{!expanded && <label>{c.taskTitle}<input maxLength={200} value={task.title[locale]} onChange={e=>update({title:{...task.title,[locale]:e.target.value}})} onBlur={()=>{if(!task.title[locale].trim())update({title:{...task.title,[locale]:c.newTask}});}} /></label>}<label>{c.notes}<textarea maxLength={10000} rows={expanded ? 2 : 3} value={task.notes[locale]} onChange={e=>update({notes:{...task.notes,[locale]:e.target.value}})} /></label><Properties task={task} update={update} copy={c}/><label className="tasks-completion"><input type="checkbox" checked={task.done} onChange={e=>update({done:e.target.checked})}/>{c.completed}</label></div>}
 {(expanded || tab==='subtasks') && <div className="tasks-subtasks">
 <div className="tasks-progress"><span>{c.progress(done,task.subtasks.length)}</span><progress value={done} max={task.subtasks.length||1} aria-label={c.subtasks}/></div>
 {!task.subtasks.length && <p className="tasks-muted">{c.none}</p>}
 <ul>{task.subtasks.map((sub,i)=><li key={sub.id} data-done={sub.done}><OrderControls label={sub.title[locale]} first={i===0} last={i===task.subtasks.length-1} copy={c} move={n=>{update({subtasks:moveItem(task.subtasks,sub.id,n)});announce(c.moved);}}/><label className="task-checkbox-touch"><input type="checkbox" aria-label={`${sub.done?c.reopen:c.complete}: ${sub.title[locale]}`} checked={sub.done} onChange={e=>update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,done:e.target.checked}:s)})}/></label><input maxLength={200} className="tasks-step-title" aria-label={`${c.stepTitle} ${i+1}`} value={sub.title[locale]} onChange={e=>update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,title:{...s.title,[locale]:e.target.value}}:s)})} onBlur={()=>{if(!sub.title[locale].trim())update({subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,title:{...s.title,[locale]:c.addStep}}:s)});}}/><button className="tasks-icon-button" aria-label={`${c.remove}: ${sub.title[locale]}`} onClick={()=>{update({subtasks:task.subtasks.filter(s=>s.id!==sub.id)});stepInput.current?.focus();}}>×</button></li>)}</ul>
 <form className="tasks-add-step" onSubmit={e=>{e.preventDefault();if(!step.trim() || task.subtasks.length>=100)return;update({subtasks:[...task.subtasks,{id:crypto.randomUUID(),title:bilingual(step.trim(),step.trim()),done:false}]});setStep('');announce(c.stepAdded);stepInput.current?.focus();}}><input ref={stepInput} aria-label={c.addStep} placeholder={`${c.addStep}…`} value={step} onChange={e=>setStep(e.target.value)} maxLength={200}/><button type="submit" aria-label={c.addStep} disabled={!step.trim() || task.subtasks.length>=100}>＋</button></form>
 </div>}
 <div className="tasks-action-buttons"><button className="tasks-primary" onClick={()=>setAction('start')}>▷ {c.start}</button><button onClick={()=>{setAction('smaller');setTab('subtasks');requestAnimationFrame(()=>stepInput.current?.focus());}}>✂ {c.smaller}</button><button onClick={()=>setAction('stuck')}>✧ {c.stuck}</button></div>
 {action && <div className="tasks-support" role="region" aria-label={c[action]}><div className="tasks-support-heading"><strong>{action==='start'?c.focus:action==='smaller'?c.smaller:c.stuckCopy}</strong><button className="tasks-icon-button" aria-label={c.close} onClick={()=>setAction(null)}>×</button></div>
 {action==='start'?<><p>{c.focusCopy}</p><button onClick={()=>setAction(null)}>{c.finish}</button></>:action==='smaller'?<p>{c.smallerCopy}</p>:<><div className="tasks-barriers">{c.barriers.map((s,i)=><button key={s} aria-pressed={barrier===i} onClick={()=>setBarrier(i)}>{s}</button>)}</div>{barrier!==null&&<p role="status">{c.suggestions[barrier]}</p>}</>}
 </div>}
 </section>;
}
