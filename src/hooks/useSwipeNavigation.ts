import { useRef, type MouseEvent, type DragEvent, type PointerEvent } from "react";

/** A horizontal gesture leaves vertical scrolling and card controls untouched. */
export function useSwipeNavigation(enabled: boolean, onStep: (direction: -1 | 1) => void) {
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  function finish(event: PointerEvent<HTMLElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    event.currentTarget.style.removeProperty("transform");
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const distance = event.clientX - current.x;
    if (!cancelled && current.dragging && Math.abs(distance) >= 40) onStep(distance < 0 ? 1 : -1);
  }
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      suppressClick.current = false;
      if (!enabled || !event.isPrimary || event.button !== 0 ||
        (event.target as Element).closest("button, a, input, select, textarea, summary")) return;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const current = gesture.current;
      if (!current || current.id !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.dragging) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { gesture.current = null; return; }
        if (Math.abs(dx) < 8) return;
        current.dragging = true;
        suppressClick.current = true;
        event.currentTarget.getAnimations().forEach(animation => animation.cancel());
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = "true";
      }
      event.currentTarget.style.transform = `translateX(${Math.max(-32, Math.min(32, dx * .2))}px)`;
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, true),
    onLostPointerCapture(event: PointerEvent<HTMLElement>) {
      // Touch transfers implicit capture from the child to the shelf when dragging starts.
      if (event.target === event.currentTarget) finish(event, true);
    },
    onClickCapture(event: MouseEvent<HTMLElement>) {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
    onDragStart(event: DragEvent<HTMLElement>) { if (enabled) event.preventDefault(); },
  };
}
