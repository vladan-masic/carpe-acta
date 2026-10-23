import { useEffect, useRef, type RefObject } from 'react';

/** Dismiss only an outside click, never a drag or a selection begun inside. */
export function useOutsideDismiss(ref:RefObject<HTMLElement|null>,enabled:boolean,dismiss:(target:Element)=>void,ignore?:string) {
 const latest=useRef(dismiss);latest.current=dismiss;
 useEffect(()=>{
  if(!enabled)return;
  let start:{id:number;x:number;y:number}|null=null;
  const outside=(event:PointerEvent)=>event.target instanceof Element && !ref.current?.contains(event.target) && !event.target.closest(ignore??'[data-no-dismiss]');
  const down=(event:PointerEvent)=>{
   start=null;
   if(event.button!==0 || event.isPrimary===false || !outside(event))return;
   if(event.clientX>=document.documentElement.clientWidth && document.documentElement.clientWidth>0)return;
   start={id:event.pointerId,x:event.clientX,y:event.clientY};
  };
  const up=(event:PointerEvent)=>{
   const began=start;start=null;
   if(!began || began.id!==event.pointerId || Math.hypot(event.clientX-began.x,event.clientY-began.y)>=6 || !outside(event))return;
   latest.current(event.target as Element);
  };
  const cancel=()=>{start=null;};
  document.addEventListener('pointerdown',down,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',cancel,true);
  return()=>{document.removeEventListener('pointerdown',down,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',cancel,true);};
 },[ref,enabled,ignore]);
}
