import { useLayoutEffect, useRef, useState, type PointerEvent, type MouseEvent, type DragEvent, type KeyboardEvent } from "react";

/** Native scrolling owns touch/trackpad inertia; mouse dragging adds only the missing gesture. */
export function useFavoritesCarousel(enabled: boolean, resetKey: string, contentKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const drag = useRef<{ id: number; x: number; y: number; left: number; lastX: number; time: number; velocity: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  function update() {
    const node = ref.current;
    if (!node) return;
    const previous = node.scrollLeft > 1;
    const next = node.scrollLeft < node.scrollWidth - node.clientWidth - 1;
    setEdges(old => old.previous === previous && old.next === next ? old : { previous, next });
  }
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollLeft = 0;
    update();
  }, [resetKey, enabled]);
  useLayoutEffect(() => {
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ref.current) observer?.observe(ref.current);
    return () => observer?.disconnect();
  }, [contentKey, enabled]);
  function stepSize() {
    const node = ref.current;
    if (!node) return 0;
    return (node.firstElementChild?.getBoundingClientRect().width ?? 0) + (parseFloat(getComputedStyle(node).columnGap) || 0);
  }
  function settle(left: number) {
    const node = ref.current;
    if (!node) return;
    const step = stepSize();
    const target = step ? Math.round(left / step) * step : left;
    node.scrollTo({ left: Math.max(0, Math.min(node.scrollWidth - node.clientWidth, target)), behavior: reduced() ? "instant" : "smooth" });
  }
  function move(direction: -1 | 1) {
    if (ref.current) settle(ref.current.scrollLeft + direction * stepSize());
  }
  function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const node = event.currentTarget;
    delete node.dataset.dragging;
    if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    if (!current.active) return;
    const velocity = !cancelled && !reduced() && performance.now() - current.time < 100 ? current.velocity : 0;
    const momentum = Math.max(-node.clientWidth * 2, Math.min(node.clientWidth * 2, velocity * 220));
    settle(node.scrollLeft + momentum);
  }
  return { ref, edges, move, handlers: {
    onScroll: update,
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      suppressClick.current = false;
      if (!enabled || event.pointerType !== "mouse" || event.button !== 0 ||
        (event.target as Element).closest("button, a, input, select, textarea, summary")) return;
      event.currentTarget.scrollTo({ left: event.currentTarget.scrollLeft, behavior: "instant" });
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, lastX: event.clientX, time: performance.now(), velocity: 0, active: false };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      const dx = event.clientX - current.x;
      if (!current.active) {
        if (Math.abs(event.clientY - current.y) > Math.abs(dx) && Math.abs(event.clientY - current.y) > 6) { drag.current = null; return; }
        if (Math.abs(dx) < 6) return;
        current.active = true;
        suppressClick.current = true;
        event.currentTarget.dataset.dragging = "true";
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      const now = performance.now();
      const elapsed = now - current.time;
      if (elapsed > 0) current.velocity = .5 * current.velocity + .5 * (current.lastX - event.clientX) / elapsed;
      current.lastX = event.clientX;
      current.time = now;
      event.currentTarget.scrollLeft = current.left - dx;
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event),
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
    onLostPointerCapture(event: PointerEvent<HTMLDivElement>) { if (event.target === event.currentTarget) finish(event, true); },
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
    onDragStart(event: DragEvent<HTMLDivElement>) { if (enabled) event.preventDefault(); },
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      if (!enabled || event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); settle(event.key === "Home" ? 0 : event.currentTarget.scrollWidth); }
    },
  } };
}
