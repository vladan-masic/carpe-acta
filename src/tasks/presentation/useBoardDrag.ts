import type { RefObject } from 'react';
import { statuses, type Status } from './boardModel';
import { usePointerDrag, type DragState as PointerDragState } from './usePointerDrag';
export { taskInteractive, type DragBindings } from './usePointerDrag';
type Target = { status: Status; beforeId: string | null };
export type DragState = PointerDragState<Target>;

export function useBoardDrag(
 board: RefObject<HTMLDivElement|null>,
 move: (id:string,status:Status,beforeId:string|null)=>void,
 announce:(message:string)=>void,
 copy:{picked:string;cancelDrag:string},
 options:{enabled?:boolean;scope?:string}={},
) {
  function locate(current: DragState): Target | null {
    const hit = document.elementFromPoint(current.x, current.y);
    const column = hit?.closest<HTMLElement>('[data-column]');
    const status = column?.dataset.column as Status | undefined;
    if (!column || !status || !statuses.includes(status) || !board.current?.contains(column)) return null;
    // List ordering never changes status; use Board or the status editor for that.
    if (board.current.dataset.dragLayout === 'list') {
      const source = [...board.current.querySelectorAll<HTMLElement>('[data-card-id]')].find(card => card.dataset.cardId === current.id);
      if (source?.closest<HTMLElement>('[data-column]')?.dataset.column !== status) return null;
    }
    const cards = [...column.querySelectorAll<HTMLElement>('[data-card-id]')].filter(card => card.dataset.cardId !== current.id);
    const before = cards.find(card => {
      const rect = card.getBoundingClientRect();
      return current.y < rect.top + rect.height / 2;
    });
    return { status, beforeId: before?.dataset.cardId ?? null };
  }

  function scroll(current: DragState) {
    const element = board.current;
    const speed = (point: number, start: number, end: number) => Math.max(-12, Math.min(12, point < start + 45
      ? -Math.ceil((start + 45 - point) / 5) : point > end - 45 ? Math.ceil((point - end + 45) / 5) : 0));
    if (element) {
      const rect = element.getBoundingClientRect();
      if (current.y >= rect.top && current.y <= rect.bottom && current.x >= rect.left && current.x <= rect.right) {
        element.scrollLeft += speed(current.x, rect.left, rect.right);
        const column = document.elementFromPoint(current.x, current.y)?.closest<HTMLElement>('[data-column]');
        const scroller = column?.querySelector<HTMLElement>('.kb-cards');
        if (scroller) {
          const bounds = scroller.getBoundingClientRect();
          scroller.scrollTop += speed(current.y, Math.max(0,bounds.top), Math.min(innerHeight,bounds.bottom));
        }
        const pageSpeed = speed(current.y, 0, innerHeight);
        if (pageSpeed) window.scrollBy(0,pageSpeed);
      }
    }
  }
  return usePointerDrag<Target>({...options,itemSelector:'[data-card-id]',locate,scroll,
    drop:(id,target)=>move(id,target.status,target.beforeId),announce,copy});
}
