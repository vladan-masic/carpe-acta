import { useEffect, useRef } from 'react';
import type { Locale } from '../../i18n/locales';
import { useFocusSession } from './FocusProvider';
import { focusSeconds } from './controller';
import { focusCopy } from './copy';
import { actionCopy } from '../presentation/actionCopy';
import { EndSessionButton } from './EndSessionButton';
import './focus.css';
export function FocusBar({locale,onOpen,availability}:{locale:Locale;onOpen?:()=>void;availability?:'loading'|'unavailable'|'blocked'}) {
 const focus=useFocusSession(),c=focusCopy[locale],a=actionCopy[locale];
 const session=focus.session;
 const bar=useRef<HTMLElement>(null);
 useEffect(()=>{
  const element=bar.current;if(!element)return;
  const size=()=>document.documentElement.style.setProperty('--task-focus-clearance',`${element.getBoundingClientRect().height+24}px`);
  size();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(size);observer?.observe(element);
  return()=>{observer?.disconnect();document.documentElement.style.removeProperty('--task-focus-clearance');};
 },[Boolean(session||focus.error)]);
 if(!session&&!focus.error)return null;
 const seconds=session?focusSeconds(session):0;
 return <>
  <div className="task-focus-clearance" aria-hidden="true"/>
  <aside ref={bar} className="task-focus-bar" aria-label={c.bar} data-no-dismiss>
   {session&&<>
    <div className="task-focus-label"><strong>{session.text}</strong><span role="status">{c[session.phase]}</span></div>
    <span className="task-focus-clock" aria-live="off" aria-label={session.minutes&&!session.overtime?c.remaining:c.elapsed}>{session.overtime?'+':''}{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span>
    <div className="task-focus-buttons">
     {['running','paused'].includes(session.phase)&&<button onClick={()=>void focus.controller?.command(session.phase==='running'?'pause':'resume',session.id)}>{session.phase==='running'?a.pause:a.resume}</button>}
     {onOpen?<button data-focus-open onClick={onOpen} disabled={availability==='loading'}>{c.open}</button>:<a href="/tasks#task-focus">{c.open}</a>}
     <EndSessionButton locale={locale} sessionId={session.id} controller={focus.controller}/>
    </div>
    {availability&&<p role="status">{c[availability]}</p>}
   </>}
   {focus.error&&<p role="alert">{c[focus.error]} {focus.error==='conflict'&&<button onClick={()=>focus.controller?.useSaved()}>{c.useSaved}</button>} {focus.error==='storage'&&<button onClick={()=>void focus.controller?.retry()}>{c.retry}</button>}</p>}
  </aside>

 </>;
}
