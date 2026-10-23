import { useEffect, useRef, useState } from 'react';
import { useActionTimer } from '../../hooks/useActionTimer';
import type { Locale } from '../../i18n/locales';
import { bilingual, type Task } from './model';
import { actionCopy } from './actionCopy';
import { AutoGrowTextarea } from './AutoGrowTextarea';
import './taskSupport.css';

export type SupportMode = 'start'|'smaller'|'stuck';
type Session = { text:string; subtaskId:string|null; stage:'working'|'review' };
const durations = [2,5,10,25,0];
export function TaskSupport({mode,task,locale,enabled=true,update,close,openStart,announce}:{
 mode:SupportMode|null;task:Task;locale:Locale;enabled?:boolean;update:(patch:Partial<Task>)=>void;
 close:()=>void;openStart:()=>void;announce:(message:string)=>void;
}) {
 const c=actionCopy[locale];
 const [choice,setChoice]=useState(()=>task.subtasks.find(s=>!s.done)?.id??'parent');
 const [draft,setDraft]=useState('');
 const [obstacle,setObstacle]=useState<number|null>(null);
 const [variant,setVariant]=useState(0);
 const [minutes,setMinutes]=useState(2);
 const [session,setSession]=useState<Session|null>(null);
 const [untimedPaused,setUntimedPaused]=useState(false);
 const [notice,setNotice]=useState('');
 const timer=useActionTimer(minutes);
 const heading=useRef<HTMLHeadingElement>(null);
 const submitted=useRef<{text:string;id:string}|null>(null);
 const previousMinutes=useRef(minutes);
 useEffect(()=>{if(submitted.current&&task.subtasks.some(s=>s.id===submitted.current?.id))submitted.current=null;},[task.subtasks]);
 // Configuration changes reset only the local timer, never task data.
 useEffect(()=>{if(previousMinutes.current!==minutes){previousMinutes.current=minutes;timer.reset();}},[minutes]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(mode)heading.current?.focus();else {timer.pause();setUntimedPaused(true);}},[mode]); // eslint-disable-line react-hooks/exhaustive-deps
 const selectedStep=task.subtasks.find(s=>s.id===choice&&!s.done);
 const actionText=choice==='custom'?draft.trim():choice==='parent'?task.title[locale]:selectedStep?.title[locale]??'';
 const invalid=Boolean(session&&(task.done||(session.subtaskId&&!task.subtasks.some(s=>s.id===session.subtaskId&&!s.done))));
 useEffect(()=>{if(invalid){timer.pause();setUntimedPaused(true);}},[invalid]); // eslint-disable-line react-hooks/exhaustive-deps
 const paused=minutes===0?untimedPaused:timer.phase==='paused'||timer.phase==='idle';
 const review=session?.stage==='review'||(minutes!==0&&timer.phase==='expired');
 function feedback(message:string){setNotice(message);announce(message);}
 function focusHeading(){requestAnimationFrame(()=>heading.current?.focus());}
 function begin(text:string,id:string|null){
  if(!text.trim()||task.done)return;
  timer.reset();if(minutes)timer.start();setUntimedPaused(false);
  setSession({text:text.trim(),subtaskId:id,stage:'working'});setNotice('');openStart();focusHeading();
 }
 function save(start:boolean){
  const text=draft.trim();if(!enabled)return;if(!text){feedback(c.blank);return;}
  const existing=task.subtasks.find(s=>s.title[locale].trim().toLocaleLowerCase()===text.toLocaleLowerCase());
  const recent=submitted.current?.text===text?submitted.current:null;
  if(existing?.done){feedback(c.invalid);return;}
  let id=existing?.id??recent?.id;
  if(!id){
   if(task.subtasks.length>=100){feedback(c.limit);return;}
   id=crypto.randomUUID();submitted.current={text,id};
   update({subtasks:[...task.subtasks,{id,title:bilingual(text,text),done:false}]});
   feedback(c.saved);
  }else feedback(c.existing);
  setChoice(id);
  if(start)begin(text,id);
 }
 function complete(parent:boolean){
  if(!enabled||!session||invalid)return;
  if(parent)update({done:true});
  else if(session.subtaskId)update({subtasks:task.subtasks.map(s=>s.id===session.subtaskId?{...s,done:true}:s)});
  timer.reset();setSession(null);feedback(c.completed);focusHeading();
 }
 function chooseObstacle(index:number,nextVariant=0){setObstacle(index);setVariant(nextVariant);setDraft(c.steps[index][nextVariant]);setNotice('');}
 const durationControl=<label>{mode==='stuck'?c.budget:c.timer}<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{durations.map(n=><option key={n} value={n}>{n?`${n} ${c.minute}`:c.noTimer}</option>)}</select></label>;
 return <section hidden={!mode} className="tasks-support task-action-support" aria-label={c.title} onKeyDown={e=>{if(e.key==='Escape'&&!(e.target instanceof HTMLSelectElement)){e.preventDefault();e.stopPropagation();close();}}}>
  <div className="tasks-support-heading"><h3 ref={heading} tabIndex={-1}>{c.title}</h3><button type="button" className="tasks-icon-button" aria-label={c.close} onClick={close}>×</button></div>
  <p className="task-action-parent">{task.title[locale]}</p>
  {!enabled&&<p role="status">{c.blocked}</p>}
  {mode==='start'&&session?<>
   <p className="task-next-action">{session.text}</p>
   {invalid?<><p role="status">{c.invalid}</p><button onClick={()=>{timer.reset();setSession(null);setChoice(task.subtasks.find(s=>!s.done)?.id??'parent');}}>{c.newAction}</button></>:<>
    <p role="status">{minutes!==0&&timer.phase==='expired'?c.expired:paused?c.paused:c.running}</p>
    {minutes!==0?<div role="timer" aria-live="off" aria-label={c.timer} className="task-focus-time">{timer.extra?'+':''}{Math.floor(timer.seconds/60)}:{String(timer.seconds%60).padStart(2,'0')}</div>:<p>{c.noTimer}</p>}
    {review?<div className="task-support-controls">
     <button onClick={()=>{timer.reset();setSession(null);feedback(c.feedback);focusHeading();}}>{c.progress}</button>
     {session.subtaskId&&<button disabled={!enabled} onClick={()=>complete(false)}>{c.completeStep}</button>}
     <button disabled={!enabled} onClick={()=>complete(true)}>{c.completeTask}</button>
     <button className="tasks-primary" onClick={()=>{setSession({...session,stage:'working'});focusHeading();if(timer.phase==='expired')timer.keepGoing();else if(minutes)timer.start();setUntimedPaused(false);}}>{c.continue}</button>
    </div>:<div className="task-support-controls">
     <button onClick={()=>{if(minutes){if(paused)timer.start();else timer.pause();}else setUntimedPaused(!untimedPaused);}}>{paused?c.resume:c.pause}</button>
     <button title={c.resetHint} onClick={()=>{timer.reset();setUntimedPaused(true);}}>{c.reset}</button>
     <button className="tasks-primary" onClick={()=>{timer.pause();setSession({...session,stage:'review'});focusHeading();}}>{c.finish}</button>
    </div>}
   </>}
  </>:mode==='start'?<>
   <label>{c.choose}<select value={choice} onChange={e=>setChoice(e.target.value)}>
    <option value="parent">{c.parent}</option>{task.subtasks.filter(s=>!s.done).map(s=><option key={s.id} value={s.id}>{s.title[locale]}</option>)}<option value="custom">{c.custom}</option>
   </select></label>
   {choice==='custom'?<label>{c.action}<AutoGrowTextarea value={draft} maxLength={200} onChange={e=>setDraft(e.target.value)}/></label>:<p className="task-next-action">{actionText||c.invalid}</p>}
   {durationControl}<button className="tasks-primary" disabled={!actionText||task.done} onClick={()=>begin(actionText,selectedStep?.id??null)}>{c.begin}</button>
  </>:<>
   {mode==='smaller'?<><p>{c.smaller}</p><details className="task-starting-prompts"><summary>{c.prompts}</summary>{c.strategies.map(text=><button key={text} onClick={()=>{setDraft(text);setNotice('');}}>{text}</button>)}</details></>:<>
    <fieldset className="task-obstacles"><legend>{c.obstacle}</legend>{c.obstacles.map((text,i)=><button key={text} aria-pressed={obstacle===i} onClick={()=>chooseObstacle(i)}>{text}</button>)}</fieldset>
    <p className="tasks-muted">{c.curated}</p>
    {obstacle!==null&&<><p>{c.suggestions[obstacle]}</p><button onClick={()=>chooseObstacle(obstacle,(variant+1)%c.steps[obstacle].length)}>{c.another}</button></>}
   </>}
   {(mode==='smaller'||obstacle!==null)&&<>
    <label>{c.action}<AutoGrowTextarea maxLength={200} value={draft} onChange={e=>{setDraft(e.target.value);setNotice('');}}/></label>
    {durationControl}
    {task.subtasks.length>=100&&<p role="status">{c.limit}</p>}
    <div className="task-support-controls"><button disabled={!enabled||!draft.trim()||task.subtasks.length>=100} onClick={()=>save(false)}>{c.save}</button><button className="tasks-primary" disabled={!enabled||!draft.trim()||task.done||task.subtasks.length>=100} onClick={()=>save(true)}>{c.saveStart}</button>
    {mode==='stuck'&&<button disabled={!draft.trim()||task.done} onClick={()=>begin(draft,null)}>{c.smallSession}</button>}</div>
   </>}
   {session&&<button onClick={openStart}>{c.resumeSession}</button>}
  </>}
  <p role="status" aria-atomic="true">{notice}</p>
 </section>;
}
