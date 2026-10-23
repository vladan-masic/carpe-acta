import type { RefObject } from 'react';
import { usePointerDrag, type DragState } from './usePointerDrag';

type Target = { beforeId: string|null };
export function useSubtaskDrag(list:RefObject<HTMLUListElement|null>,drop:(id:string,beforeId:string|null)=>void,announce:(message:string)=>void,copy:{picked:string;cancelDrag:string},enabled:boolean,scope:string) {
 return usePointerDrag<Target>({enabled,scope,itemSelector:'[data-subtask-id]',announce,copy,
  locate(current:DragState<Target>) {
   const element=list.current,hit=document.elementFromPoint(current.x,current.y);
   if(!element || !hit || !element.contains(hit))return null;
   const rows=[...element.querySelectorAll<HTMLElement>('[data-subtask-id]')].filter(row=>row.dataset.subtaskId!==current.id);
   const before=rows.find(row=>{const rect=row.getBoundingClientRect();return current.y<rect.top+rect.height/2;});
   return {beforeId:before?.dataset.subtaskId??null};
  },
  scroll(current) {
   const panel=list.current?.closest<HTMLElement>('.kb-detail-wrap');
   const bounds=panel?.getBoundingClientRect();
   const top=Math.max(0,bounds?.top??0),bottom=Math.min(innerHeight,bounds?.bottom??innerHeight);
   const delta=current.y<top+48?-8:current.y>bottom-48?8:0;
   if(!delta)return;
   if(panel && panel.scrollHeight>panel.clientHeight){const old=panel.scrollTop;panel.scrollTop+=delta;if(old!==panel.scrollTop)return;}
   window.scrollBy(0,delta);
  },
  drop:(id,target)=>drop(id,target.beforeId),
 });
}
