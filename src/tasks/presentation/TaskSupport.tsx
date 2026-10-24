import { useEffect, useRef, useState } from 'react';
import { useFocusSession } from '../focus/FocusProvider';
import { EndSessionButton } from '../focus/EndSessionButton';
import { focusCopy } from '../focus/copy';
import { focusSeconds, type FocusInput } from '../focus/controller';
import type { Locale } from '../../i18n/locales';
import { bilingual, type Task } from './model';
import { actionCopy } from './actionCopy';
import { AutoGrowTextarea } from './AutoGrowTextarea';
import './taskSupport.css';

export type SupportMode = 'start'|'smaller'|'stuck';
const durations = [2,5,10,25,0];
export function TaskSupport({mode,task,locale,enabled=true,reveal=0,update,close,openStart,announce}:{
 reveal?:number;mode:SupportMode|null;task:Task;locale:Locale;enabled?:boolean;update:(patch:Partial<Task>)=>void;
 close:()=>void;openStart:()=>void;announce:(message:string)=>void;
}) {
 const c=actionCopy[locale],f=focusCopy[locale];
 const focus=useFocusSession();
 const session=focus.session?.taskId===task.id?focus.session:null;
 const [pending,setPending]=useState<{input:FocusInput;existingId:string}|null>(null);
 const [choice,setChoice]=useState(()=>task.subtasks.find(s=>!s.done)?.id??'parent');
 const [draft,setDraft]=useState('');
 const [obstacle,setObstacle]=useState<number|null>(null);
 const [variant,setVariant]=useState(0);
 const [minutes,setMinutes]=useState(2);
 const [notice,setNotice]=useState('');
 const seconds=session?focusSeconds(session):0;
 const command=(action:'pause'|'resume'|'reset'|'finish'|'continue'|'end')=>{if(session)void focus.controller?.command(action,session.id);};
 const heading=useRef<HTMLHeadingElement>(null);
 const completedSession=useRef<string|null>(null);
 const submitted=useRef<{text:string;id:string}|null>(null);
 useEffect(()=>{if(submitted.current&&task.subtasks.some(s=>s.id===submitted.current?.id))submitted.current=null;},[task.subtasks]);
 useEffect(()=>{if(mode){heading.current?.focus();if(reveal)heading.current?.closest('section')?.scrollIntoView({block:'nearest'});}},[mode,reveal]);
 const selectedStep=task.subtasks.find(s=>s.id===choice&&!s.done);
 const actionText=choice==='custom'?draft.trim():choice==='parent'?task.title[locale]:selectedStep?.title[locale]??'';
 const invalid=Boolean(session&&(task.done||(session.subtaskId&&!task.subtasks.some(s=>s.id===session.subtaskId&&!s.done))));
 useEffect(()=>{if(invalid&&session?.phase==='running')command('pause');},[invalid,session?.id]);
 const paused=session?.phase==='paused';
 const review=session?.phase==='review'||session?.phase==='expired';
 function feedback(message:string){setNotice(message);announce(message);}
 function focusHeading(){requestAnimationFrame(()=>heading.current?.focus());}
 async function begin(text:string,id:string|null,replaceId?:string,duration=minutes){
  if(!text.trim()||task.done||!focus.controller)return;
  const input={taskId:task.id,subtaskId:id,text:text.trim(),minutes:duration};
  const started=await focus.controller.start(input,replaceId);
  if(!started){const existing=focus.controller.getSnapshot().session;if(existing)setPending({input,existingId:existing.id});feedback(f.other);return;}
  setPending(null);setNotice('');openStart();focusHeading();
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
  if(!enabled||focus.error==='conflict'||!session||invalid||completedSession.current===session.id)return;
  focus.controller?.restore();
  if(focus.controller?.getSnapshot().session?.id!==session.id){feedback(f.changed);return;}
  completedSession.current=session.id;
  if(parent)update({done:true});
  else if(session.subtaskId)update({subtasks:task.subtasks.map(s=>s.id===session.subtaskId?{...s,done:true}:s)});
  command('finish');feedback(c.completed);focusHeading();
 }
 function chooseObstacle(index:number,nextVariant=0){setObstacle(index);setVariant(nextVariant);setDraft(c.steps[index][nextVariant]);setNotice('');}
 const durationControl=<label>{mode==='stuck'?c.budget:c.timer}<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{durations.map(n=><option key={n} value={n}>{n?`${n} ${c.minute}`:c.noTimer}</option>)}</select></label>;
 return <section hidden={!mode} className="tasks-support task-action-support" aria-label={c.title} onKeyDown={e=>{if(e.key==='Escape'&&!(e.target instanceof HTMLSelectElement)&&!(e.target instanceof Element&&e.target.closest('dialog'))){e.preventDefault();e.stopPropagation();close();}}}>
  <div className="tasks-support-heading"><h3 ref={heading} tabIndex={-1}>{c.title}</h3><button type="button" className="tasks-icon-button" aria-label={f.minimize} onClick={close}>×</button></div>
  <p className="task-action-parent">{task.title[locale]}</p>
  <p className="task-focus-local">{f.local}</p>
  {!enabled&&<p role="status">{f.blocked}</p>}
  {focus.error&&<p role="alert">{f[focus.error]}</p>}
  {pending&&<div className="task-support-controls" role="group" aria-label={f.other}>
   <p>{f.other}</p><button onClick={()=>{setPending(null);focus.requestOpen();}}>{f.return}</button>
   <button onClick={()=>void begin(pending.input.text,pending.input.subtaskId,pending.existingId,pending.input.minutes)}>{f.replace}</button>
   <button onClick={()=>setPending(null)}>{f.cancel}</button>
  </div>}
  {mode==='start'&&session?<>
   <p className="task-next-action">{session.text}</p>
   {invalid?<><p role="status">{c.invalid}</p><EndSessionButton locale={locale} sessionId={session.id} controller={focus.controller}/></>:<>
    <p role="status">{session.phase==='expired'?c.expired:session.phase==='review'?f.review:paused?c.paused:c.running}</p>
    <div role="timer" aria-live="off" aria-label={session.minutes?c.timer:f.elapsed} className="task-focus-time">{session.overtime?'+':''}{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</div>{!session.minutes&&<p>{c.noTimer}</p>}
    {review?<div className="task-support-controls">
     <button onClick={()=>{command('end');feedback(c.feedback);focusHeading();}}>{c.progress}</button>
     {session.subtaskId&&<button disabled={!enabled||focus.error==='conflict'} onClick={()=>complete(false)}>{c.completeStep}</button>}
     <button disabled={!enabled||focus.error==='conflict'} onClick={()=>complete(true)}>{c.completeTask}</button>
     <button className="tasks-primary" onClick={()=>{command('continue');focusHeading();}}>{c.continue}</button>
    </div>:<div className="task-support-controls">
     <button onClick={()=>{command(paused?'resume':'pause');}}>{paused?c.resume:c.pause}</button>
     <button title={c.resetHint} onClick={()=>{command('reset');}}>{c.reset}</button>
     <button className="tasks-primary" onClick={()=>{command('finish');focusHeading();}}>{c.finish}</button>
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
