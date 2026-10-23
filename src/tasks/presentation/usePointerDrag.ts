import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type DOMAttributes } from 'react';

export type DragState<T> = {
  id: string; x: number; y: number; width: number; height: number;
  offsetX: number; offsetY: number; target: T | null;
};
type Session<T> = DragState<T> & { startX: number; startY: number; pointerId: number; active: boolean; element: HTMLElement };
export type DragBindings = DOMAttributes<HTMLElement>;
export const taskInteractive = 'button, a, input, select, textarea, summary, label, [contenteditable], [role="button"], [role="radio"]';

/** Shared gesture lifecycle; callers own drop targets and ordering rules. */
export function usePointerDrag<T>(options: {
 enabled?: boolean; scope?: string; itemSelector: string;
 locate: (current: DragState<T>) => T | null;
 scroll: (current: DragState<T>) => void;
 drop: (id: string, target: T) => void;
 announce: (message: string) => void;
 copy: { picked: string; cancelDrag: string };
}) {
  const {announce,copy}=options;
  const enabled=options.enabled??true;
  const latest=useRef(options); latest.current=options;
  const [drag,setDrag]=useState<DragState<T>|null>(null);
  const session=useRef<Session<T>|null>(null);
  const suppressClick=useRef<string|null>(null);
  const frame=useRef(0);
  function tick() {
    const current=session.current;
    if(!current?.active)return;
    latest.current.scroll(current);
    current.target=latest.current.locate(current);
    setDrag({...current});
    frame.current=requestAnimationFrame(tick);
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
      if (event.key === 'Escape' && session.current) { event.preventDefault(); event.stopPropagation(); cancel(); }
    };
    window.addEventListener('keydown', escape, true);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('keydown', escape, true);
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
        const card = event.currentTarget.closest<HTMLElement>(options.itemSelector);
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
          const target = latest.current.locate(current);
          clear();
          if (target) latest.current.drop(current.id, target);
          else announce(copy.cancelDrag);
        } else clear();
      },
      onPointerCancel: cancel,
      onLostPointerCapture(event) { if (session.current?.element === event.currentTarget) cancel(); },
    };
  }
  return { drag, handle: (id: string) => bindings(id,false), surface: (id: string) => bindings(id,true) };
}
