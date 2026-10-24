import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/locales';
import type { FocusController } from './controller';
import { focusCopy } from './copy';

export function EndSessionButton({locale,sessionId,controller}:{locale:Locale;sessionId:string;controller:FocusController|null}) {
 const c=focusCopy[locale];
 const [confirm,setConfirm]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(confirm)dialog.current?.showModal();},[confirm]);
 useEffect(()=>setConfirm(false),[sessionId]);
 function dismiss(){dialog.current?.close();setConfirm(false);opener.current?.focus();}
 return <>
  <button ref={opener} onClick={()=>setConfirm(true)}>{c.end}</button>
  {confirm&&<dialog ref={dialog} className="task-focus-dialog" aria-label={c.end} onCancel={dismiss} onClose={()=>setConfirm(false)}>
   <p>{c.confirm}</p><button autoFocus onClick={dismiss}>{c.cancel}</button><button onClick={()=>{void controller?.command('end',sessionId);dismiss();}}>{c.confirmEnd}</button>
  </dialog>}
 </>;
}
