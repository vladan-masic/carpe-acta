import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { statuses, type Status } from './boardModel';

type Target = { status: Status; beforeId: string | null };
export type DragState = {
  id: string; x: number; y: number; width: number; height: number;
  offsetX: number; offsetY: number; target: Target | null;
};
type Session = DragState & { startX: number; startY: number; pointerId: number; active: boolean };

/** Pointer capture keeps touch and mouse on the same path; only handles disable touch scrolling. */
export function useBoardDrag(
  board: RefObject<HTMLDivElement | null>,
  move: (id: string, status: Status, beforeId: string | null) => void,
  announce: (message: string) => void,
  copy: { picked: string; cancelDrag: string },
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const session = useRef<Session | null>(null);
  const frame = useRef(0);

  function locate(current: Session): Target | null {
    const hit = document.elementFromPoint(current.x, current.y);
    const column = hit?.closest<HTMLElement>('[data-column]');
    const status = column?.dataset.column as Status | undefined;
    if (!column || !status || !statuses.includes(status) || !board.current?.contains(column)) return null;
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
    if (element) {
      const rect = element.getBoundingClientRect();
      const within = current.y >= rect.top && current.y <= rect.bottom && current.x >= rect.left && current.x <= rect.right;
      const speed = (point: number, start: number, end: number) => Math.max(-12, Math.min(12, point < start + 45
        ? -Math.ceil((start + 45 - point) / 5) : point > end - 45 ? Math.ceil((point - end + 45) / 5) : 0));
      if (within) {
        element.scrollLeft += speed(current.x, rect.left, rect.right);
        const column = document.elementFromPoint(current.x, current.y)?.closest<HTMLElement>('[data-column]');
        const scroller = column?.querySelector<HTMLElement>('.kb-cards');
        if (scroller) {
          const bounds = scroller.getBoundingClientRect();
          scroller.scrollTop += speed(current.y, bounds.top, bounds.bottom);
        }
      }
    }
    current.target = locate(current);
    setDrag({ ...current });
    frame.current = requestAnimationFrame(tick);
  }

  function cancel() {
    cancelAnimationFrame(frame.current);
    if (session.current?.active) announce(copy.cancelDrag);
    session.current = null;
    setDrag(null);
  }

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && session.current) {
        event.preventDefault();
        cancel();
      }
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('blur', cancel);
      cancelAnimationFrame(frame.current);
      session.current = null;
    };
  }, [copy.cancelDrag]);

  return {
    drag,
    handle(id: string) {
      return {
        onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
          if (event.button !== 0 || !event.isPrimary || session.current) return;
          const card = event.currentTarget.closest<HTMLElement>('[data-card-id]');
          if (!card) return;
          const rect = card.getBoundingClientRect();
          session.current = {
            id, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY,
            width: rect.width, height: rect.height, offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top, pointerId: event.pointerId, active: false, target: null,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
          const current = session.current;
          if (!current || event.pointerId !== current.pointerId) return;
          current.x = event.clientX;
          current.y = event.clientY;
          if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) >= 6) {
            current.active = true;
            announce(copy.picked);
            frame.current = requestAnimationFrame(tick);
          }
        },
        onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
          const current = session.current;
          if (!current || event.pointerId !== current.pointerId) return;
          cancelAnimationFrame(frame.current);
          if (current.active) {
            current.x = event.clientX;
            current.y = event.clientY;
            const target = locate(current);
            if (target) move(current.id, target.status, target.beforeId);
            else announce(copy.cancelDrag);
          }
          session.current = null;
          setDrag(null);
        },
        onPointerCancel: cancel,
        onLostPointerCapture: cancel,
      };
    },
  };
}
