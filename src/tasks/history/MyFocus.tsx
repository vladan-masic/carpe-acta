import { containDialogFocus } from './dialog';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/locales';
import type { Task } from '../domain';
import { useHistory } from './HistoryProvider';
import { HISTORY_KEY, readHistory } from './persistence';
import { statistics, weeklyBars, type FocusEntry, type Period } from './domain';
import { duration, historyCopy, outcomeLabel, sessionDate } from './copy';
import './history.css';
function useCalendarNow(entries: FocusEntry[]) {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const tick=()=>setNow(new Date());tick();const timer=setInterval(tick,60000);window.addEventListener('focus',tick);return()=>{clearInterval(timer);window.removeEventListener('focus',tick);};},[entries]);
  return now;
}
export function MyFocus({locale,tasks,openTask}:{locale:Locale;tasks:Task[];openTask:(id:string,opener:HTMLButtonElement)=>void}) {
  const history=useHistory(),c=historyCopy[locale],now=useCalendarNow(history.entries);
  const [period,setPeriod]=useState<Period>('week'),[count,setCount]=useState(5);
  const [deleting,setDeleting]=useState<FocusEntry|null>(null),[guest,setGuest]=useState<{count:number;error:boolean}>({count:0,error:false});
  const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
  const summary=statistics(history.entries,period,now),bars=weeklyBars(history.entries,now),max=Math.max(60,...bars.map(b=>b.seconds));
  const recent=[...summary.entries].sort((a,b)=>Date.parse(b.endedAt)-Date.parse(a.endedAt)||a.id.localeCompare(b.id));
  useEffect(()=>{
    if(!history.store?.owner)return;
    const check=()=>{try{setGuest({count:readHistory().entries.filter(e=>!history.seen.includes(e.sessionId)).length,error:false});}catch{setGuest({count:0,error:true});}};
    const changed=(e:StorageEvent)=>{if(e.key===HISTORY_KEY||e.key===null)check();};
    check();window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);
  },[history.store,history.seen]);
  useEffect(()=>{if(deleting)dialog.current?.showModal();},[deleting]);
  function closeDelete(){setDeleting(null);if(opener.current?.isConnected)opener.current.focus();else document.getElementById('my-focus-heading')?.focus();}
  return <section className="my-focus" aria-labelledby="my-focus-heading">
    <header className="my-focus-heading"><div><h2 id="my-focus-heading" tabIndex={-1}>{c.title}</h2><p>{c.intro}</p></div>
      <label>{c.period}<select value={period} onChange={e=>{setPeriod(e.target.value as Period);setCount(5);}}>{(['week','month','all'] as const).map(p=><option value={p} key={p}>{c[p]}</option>)}</select></label></header>
    {history.error&&<p role="alert">{c.error} <button onClick={()=>void history.store?.refresh()}>{c.retry}</button></p>}
    {!history.ready&&!history.error&&<p role="status">{c.loading}</p>}
    {history.ready&&<>
      <dl className="focus-metrics"><div><dt>{c.time}</dt><dd>{duration(summary.seconds,locale)}</dd></div><div><dt>{c.sessions}</dt><dd>{new Intl.NumberFormat(locale).format(summary.sessions)}</dd></div><div><dt>{c.days}</dt><dd>{new Intl.NumberFormat(locale).format(summary.days)}</dd></div></dl>
      {!history.entries.length?<p className="focus-empty">{c.empty}</p>:<>
        <div className="focus-history-columns"><section className="focus-week" aria-labelledby="focus-chart-heading"><h3 id="focus-chart-heading">{c.chart}</h3>
          <ul className="focus-chart">{bars.map(({day,seconds})=><li key={day.toISOString()}><span className="focus-bar-track" aria-hidden="true"><span style={{height:`${seconds/max*100}%`}}/></span><span aria-hidden="true">{new Intl.DateTimeFormat(locale,{weekday:'short'}).format(day)}</span><span className="focus-sr-only">{new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long'}).format(day)}: {duration(seconds,locale)}</span><span className="focus-bar-value" aria-hidden="true">{seconds?`${Math.floor(seconds/60)} min`:'—'}</span></li>)}</ul>
          <p className="focus-note">{c.dayHint}</p>
        </section><section className="focus-recent" aria-labelledby="focus-recent-heading"><h3 id="focus-recent-heading">{c.recent}</h3>
          {!recent.length&&<p>{c.noPeriod}</p>}
          <ol>{recent.slice(0,count).map(entry=>{
            const task=tasks.find(t=>t.id===entry.taskId),step=task?.subtasks.find(s=>s.id===entry.subtaskId);
            return <li key={entry.id}><div>{task?<button className="focus-task-link" onClick={e=>openTask(task.id,e.currentTarget)}>{task.title}</button>:<strong>{c.unavailable}</strong>}
              {entry.subtaskId&&<span className="focus-entry-step">{step?.title??c.stepUnavailable}</span>}
              <time dateTime={entry.endedAt}>{sessionDate(entry.endedAt,locale)}</time><span>{duration(entry.focusedSeconds,locale)} · {outcomeLabel(entry.outcome,locale)}</span></div>
              <button className="focus-delete" aria-label={`${c.remove}: ${task?.title??c.unavailable}, ${sessionDate(entry.endedAt,locale)}`} disabled={history.busy} onClick={e=>{opener.current=e.currentTarget;setDeleting(entry);}}>×</button></li>;
          })}</ol>
          {recent.length>count&&<button onClick={()=>setCount(n=>n+5)}>{c.more}</button>}
        </section></div>
      </>}
    </>}
    {history.store?.owner&&(guest.count>0||guest.error)&&<aside className="focus-import"><h3>{c.importTitle}</h3><p>{guest.error?c.importError:c.importHint}</p>{guest.count>0&&<button disabled={history.busy||!history.ready} onClick={()=>void history.store?.importGuest()}>{c.import} ({guest.count})</button>}</aside>}
    {deleting&&<dialog onKeyDown={containDialogFocus} ref={dialog} className="focus-review" aria-labelledby="focus-delete-heading" onCancel={e=>{e.preventDefault();if(!history.busy)closeDelete();}}><h2 id="focus-delete-heading">{c.deleteTitle}</h2><p>{c.deleteHint}</p><p>{sessionDate(deleting.endedAt,locale)} · {duration(deleting.focusedSeconds,locale)}</p>
      {history.error&&<p role="alert">{c.error}</p>}<div className="focus-review-actions"><button autoFocus disabled={history.busy} onClick={closeDelete}>{c.cancel}</button><button disabled={history.busy} onClick={async()=>{if(await history.store?.remove(deleting.id))closeDelete();}}>{c.confirmDelete}</button></div></dialog>}
  </section>;
}
export function TaskFocusSummary({taskId,locale}:{taskId:string;locale:Locale}) {
  const history=useHistory(),c=historyCopy[locale];
  if(!history.store)return null;
  const entries=history.entries.filter(e=>e.taskId===taskId),seconds=entries.reduce((sum,e)=>sum+e.focusedSeconds,0);
  const latest=entries.map(e=>e.endedAt).sort((a,b)=>Date.parse(a)-Date.parse(b)).slice(-1)[0];
  return <section className="task-focus-summary" aria-label={c.summary}><h3>{c.summary}</h3>
    {history.error?<p>{c.error}</p>:!history.ready?<p>{c.loading}</p>:entries.length?<><p>{c.sessions}: <strong>{entries.length}</strong> · {c.time}: <strong>{duration(seconds,locale)}</strong></p>{latest&&<p>{c.latest}: <time dateTime={latest}>{sessionDate(latest,locale)}</time></p>}</>:<p>{c.noTask}</p>}
  </section>;
}
