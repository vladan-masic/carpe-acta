import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type AppToolbarProps = {
  label: string;
  children: ReactNode;
};

export function AppToolbar({ label, children }: AppToolbarProps) {
  const [open, setOpen] = useState(false);
  const controlsId = useId();
  const toolbar = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      const target = event.target as Element;
      // Account dialogs live in the top layer; keep their return target available.
      if (!toolbar.current?.contains(target) && !target.closest("dialog")) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div className="app-toolbar" ref={toolbar} onKeyDown={(event) => {
      if (open && event.key === "Escape" && !event.defaultPrevented && !(event.target as Element).closest("dialog")) {
        setOpen(false);
        trigger.current?.focus();
      }
    }} onBlur={(event) => {
      const next = event.relatedTarget as Element | null;
      if (next && !event.currentTarget.contains(next) && !next.closest("dialog")) setOpen(false);
    }}>
      <button className="toolbar-menu-toggle secondary-button" type="button" ref={trigger}
        aria-expanded={open} aria-controls={controlsId} onClick={() => setOpen(!open)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={open ? "m6 6 12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
        {label}
      </button>
      <div className="toolbar-controls" id={controlsId} data-open={open} onClick={(event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[href="#favorites-title"]');
        if (link) {
          setOpen(false);
          document.getElementById("favorites-title")?.focus({ preventScroll: true });
        }
      }}>{children}</div>
    </div>
  );
}
