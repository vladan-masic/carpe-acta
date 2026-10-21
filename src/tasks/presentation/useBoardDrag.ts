import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject, type DOMAttributes } from 'react';
import { statuses, type Status } from './boardModel';

type Target = { status: Status; beforeId: string | null };
export type DragState = {
  id: string; x: number; y: number; width: number; height: number;
  offsetX: number; offsetY: number; target: Target | null;
};
type Session = DragState & { startX: number; startY: number; pointerId: number; active: boolean; element: HTMLElement };
export type DragBindings = DOMAttributes<HTMLElement>;
export const taskInteractive = 'button, a, input, select, textarea, summary, label, [contenteditable], [role="button"], [role="radio"]';

/** Mouse/pen can use card surfaces. Only handles capture touch, leaving card swipes to the browser. */
export function useBoardDrag(
  board: RefObject<HTMLDivElement | null>,
  move: (id: string, status: Status, beforeId: string | null) => void,
  announce: (message: string) => void,
  copy: { picked: string; cancelDrag: string },
  options: { enabled?: boolean; scope?: string } = {},
) {
  const enabled = options.enabled ?? true;
  const [drag, setDrag] = useState<DragState | null>(null);
  const session = useRef<Session | null>(null);
  const suppressClick = useRef<string | null>(null);
  const frame = useRef(0);

  function locate(current: Session): Target | null {
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

  function tick() {
    const current = session.current;
    if (!current?.active) return;
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
    current.target = locate(current);
    setDrag({ ...current });
    frame.current = requestAnimationFrame(tick);
  }

  function clear() {
    cancelAnimationFrame(frame.current);
    const current = session.current;
    session.current = null;
    if (current?.element.hasPointerCapture?.(current.pointerId)) current.element.releasePointerCapture(current.pointerId);
    setDrag(null);
  }
  function cancel() {
    if (session.current?.active) { suppressClick.current = session.current.id; announce(copy.cancelDrag); }
    clear();
  }

  useEffect(() => {
    cancel();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && session.current) { event.preventDefault(); cancel(); }
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('blur', cancel);
      cancelAnimationFrame(frame.current);
      const current = session.current;
      session.current = null;
      if (current?.element.hasPointerCapture?.(current.pointerId)) current.element.releasePointerCapture(current.pointerId);
    };
  }, [copy.cancelDrag, enabled, options.scope]);

  function bindings(id: string, surface: boolean): DragBindings {
    return {
      onClickCapture(event) {
        if (suppressClick.current === id && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = null; }
      },
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        if (!enabled || event.button !== 0 || !event.isPrimary || session.current) return;
        suppressClick.current = null;
        if (surface && (event.pointerType === 'touch' || (event.target as Element).closest(taskInteractive))) return;
        const card = event.currentTarget.closest<HTMLElement>('[data-card-id]');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        session.current = {
          id, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY,
          width: rect.width, height: rect.height, offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top, pointerId: event.pointerId, active: false, target: null, element: event.currentTarget,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        const current = session.current;
        if (!current || current.element !== event.currentTarget || event.pointerId !== current.pointerId) return;
        current.x = event.clientX;
        current.y = event.clientY;
        if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) >= 6) {
          current.active = true;
          announce(copy.picked);
          frame.current = requestAnimationFrame(tick);
        }
      },
      onPointerUp(event: ReactPointerEvent<HTMLElement>) {
        const current = session.current;
        if (!current || current.element !== event.currentTarget || event.pointerId !== current.pointerId) return;
        if (current.active) {
          suppressClick.current = id;
          current.x = event.clientX; current.y = event.clientY;
          const target = locate(current);
          clear();
          if (target) move(current.id, target.status, target.beforeId);
          else announce(copy.cancelDrag);
        } else clear();
      },
      onPointerCancel: cancel,
      onLostPointerCapture(event) { if (session.current?.element === event.currentTarget) cancel(); },
    };
  }
  return { drag, handle: (id: string) => bindings(id,false), surface: (id: string) => bindings(id,true) };
}
