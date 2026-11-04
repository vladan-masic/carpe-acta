import { containDialogFocus } from './dialog';
import { actionCopy } from '../presentation/actionCopy';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/locales';
import type { Task } from '../domain';
import type { FocusController, FocusSession } from '../focus/controller';
import { useHistory } from './HistoryProvider';
import { MAX_FOCUSED_SECONDS, outcomes, type FocusOutcome } from './domain';
import { duration, historyCopy, outcomeLabel } from './copy';
import './history.css';
export function SessionReview({session,controller,locale,task,onComplete,onClose}:{onComplete?:(parent:boolean)=>void;session:FocusSession;controller:FocusController;locale:Locale;task?:Task;onClose:(result?:'saved'|'discarded')=>void}) {
  const c=historyCopy[locale],history=useHistory(),dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef(document.activeElement as HTMLElement|null);
  const [minutes,setMinutes]=useState(session.recording?String(Math.floor(session.recording.focusedSeconds/60)):'');
  const [seconds,setSeconds]=useState(session.recording?String(session.recording.focusedSeconds%60):'0');
  const [outcome,setOutcome]=useState<FocusOutcome|''>(session.recording?.outcome??'');
  const [busy,setBusy]=useState(false),[error,setError]=useState(false);
  const total=Math.floor((session.totalMs??session.elapsedMs)/1000),max=Math.min(MAX_FOCUSED_SECONDS,total);
  const value=Number(minutes)*60+Number(seconds);
  const valid=minutes.trim()!=='' && /^\d+$/.test(minutes) && /^\d+$/.test(seconds) && Number(seconds)<60 && value>=1 && value<=max;
  const step=task?.subtasks.find(s=>s.id===session.subtaskId);
  useEffect(()=>{
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
    return()=>{if(opener.current?.isConnected)opener.current.focus();else document.querySelector<HTMLElement>('#my-focus-heading, #task-detail-heading, main h1')?.focus();};
  },[]);
  async function save() {
    if(busy || !history.store || (!valid&&!session.recording))return;
    setBusy(true);setError(false);
    try {if(controller.getSnapshot().error==='storage')await controller.retry();if(await controller.record(session.id,value,outcome||null,history.store.save))onClose('saved');else setError(true);}
    catch {setError(true);}finally {setBusy(false);}
  }
  async function transition(action:'end'|'continue') {
    if(busy)return;
    setBusy(true);
    try {if(await controller.command(action,session.id))onClose(action==='end'?'discarded':undefined);else setError(true);}
    catch {setError(true);}finally {setBusy(false);}
  }
  return <dialog onKeyDown={containDialogFocus} ref={dialog} className="focus-review" aria-labelledby="focus-review-heading" aria-describedby="focus-review-hint" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header><h2 id="focus-review-heading">{c.review}</h2><button aria-label={c.close} disabled={busy} onClick={()=>onClose()}>×</button></header>
    <dl className="focus-review-context"><dt>{c.task}</dt><dd>{task?.title??c.unavailable}</dd>
      {session.subtaskId&&<><dt>{c.subtask}</dt><dd>{step?.title??c.stepUnavailable}</dd></>}
      <dt>{c.action}</dt><dd>{session.text}</dd><dt>{c.elapsed}</dt><dd>{duration(total,locale)}</dd></dl>
    <p id="focus-review-hint">{c.durationHint}</p>
    {onComplete&&task&&!task.completedAt&&<div className="focus-review-actions">
      {step&&!step.completedAt&&<button disabled={busy||Boolean(session.recording)} onClick={()=>{onComplete(false);setOutcome('subtask');}}>{actionCopy[locale].completeStep}</button>}
      <button disabled={busy||Boolean(session.recording)} onClick={()=>{onComplete(true);setOutcome('task');}}>{actionCopy[locale].completeTask}</button>
    </div>}
    <form onSubmit={e=>{e.preventDefault();void save();}}>
      <fieldset disabled={busy||Boolean(session.recording)}><legend>{c.actual}</legend>
        <div className="focus-duration-inputs"><label>{c.minutes}<input autoFocus inputMode="numeric" type="number" min="0" max="720" step="1" value={minutes} onChange={e=>setMinutes(e.target.value)} aria-describedby="focus-duration-limit" required/></label>
          <label>{c.seconds}<input inputMode="numeric" type="number" min="0" max="59" step="1" value={seconds} onChange={e=>setSeconds(e.target.value)} required/></label></div>
        <p id="focus-duration-limit">{c.limit} {c.max}: {duration(max,locale)}.</p>
        <label>{c.outcome}<select value={outcome} onChange={e=>setOutcome(e.target.value as FocusOutcome|'')}><option value="">{c.none}</option>{outcomes.map(o=><option key={o} value={o}>{outcomeLabel(o,locale)}</option>)}</select></label>
        <p>{c.outcomeHint}</p>
      </fieldset>
      {session.recording&&<p role="status">{c.pending}</p>}
      {error&&<p role="alert">{c.saveError}</p>}
      <div className="focus-review-actions"><button className="tasks-primary" type="submit" disabled={busy||!history.store||(!valid&&!session.recording)}>{busy?c.saving:c.save}</button>
        <button type="button" disabled={busy||Boolean(session.recording)} onClick={()=>void transition('end')}>{c.discard}</button>
        {!task?.completedAt&&!(session.subtaskId&&(!step||step.completedAt))&&task&&<button type="button" disabled={busy||Boolean(session.recording)} onClick={()=>void transition('continue')}>{c.continue}</button>}
      </div>
    </form>
  </dialog>;
}
