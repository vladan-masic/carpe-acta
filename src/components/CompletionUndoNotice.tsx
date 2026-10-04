import { useEffect, useRef, useState } from "react";
import type { CompletionUndo } from "../hooks/useTipCompletion";
import type { Locale } from "../i18n/locales";
import { undoMessages } from "../i18n/undo";

export const undoNoticeDuration = 15_000;

export function CompletionUndoNotice({ undo, title, locale, busy, onUndo, onDismiss }: {
  undo: CompletionUndo | null; title: string; locale: Locale; busy: boolean;
  onUndo: () => void; onDismiss: () => void;
}) {
  const copy = undoMessages[locale];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const notice = useRef<HTMLDivElement>(null);
  function dismiss() {
    if (notice.current?.contains(document.activeElement)) document.getElementById("active-tip-title")?.focus();
    onDismiss();
  }
  useEffect(() => {
    // Give keyboard and pointer users time to act; errors remain retryable.
    if (!undo || (undo.phase !== "available" && undo.phase !== "done") || busy || hovered || focused) return;
    const timeout = window.setTimeout(onDismiss, undoNoticeDuration);
    return () => window.clearTimeout(timeout);
  }, [undo, busy, hovered, focused, onDismiss]);

  return <div ref={notice} className={undo ? "completion-undo" : undefined}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    }}>
    <div role="status" aria-atomic="true">
      {undo && <><strong>{title}</strong><p>{copy[undo.phase]}</p></>}
    </div>
    {undo && <div className="tip-actions" role="group" aria-label={copy.label}>
      <button type="button" className="secondary-button"
        disabled={undo.phase === "undoing" || (busy && undo.phase !== "done")} onClick={undo.phase === "done" ? dismiss : onUndo}>
        {undo.phase === "done" ? copy.dismiss : undo.phase === "error" ? copy.retry : copy.undo}
      </button>
      {undo.phase !== "done" && <button type="button" className="secondary-button" disabled={undo.phase === "undoing"} onClick={dismiss}>{copy.dismiss}</button>}
    </div>}
  </div>;
}
