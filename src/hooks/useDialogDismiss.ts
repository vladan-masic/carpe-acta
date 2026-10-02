import { useRef, type MouseEvent } from "react";

function isBackdrop(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  // Native dialog backdrops target the dialog too; its padding is still inside.
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

/** Close only when a complete primary-pointer click occurs on the backdrop. */
export function useDialogDismiss() {
  const startedOutside = useRef(false);
  return {
    onPointerDown: (event: React.PointerEvent<HTMLDialogElement>) => {
      startedOutside.current = event.button === 0 && isBackdrop(event);
    },
    onPointerCancel: () => { startedOutside.current = false; },
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      const dismiss = startedOutside.current && isBackdrop(event);
      startedOutside.current = false;
      if (dismiss) event.currentTarget.close();
    },
  };
}
