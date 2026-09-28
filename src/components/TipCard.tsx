import type { LocalizedTip } from "../types/tip";
import type { ReactNode } from "react";

type TipCardProps = {
  actionLabel: string;
  buttonLabel: string;
  tip: LocalizedTip;
  onGenerateTip: () => void;
  completionCopy: {
    button: string;
    completed: string;
    confirmation: string;
    unsaved: string;
    next: string;
  };
  completionStatus: "saved" | "unsaved" | null;
  onComplete: () => void;
  favoriteButton: ReactNode;
};

export function TipCard({
  actionLabel,
  buttonLabel,
  tip,
  onGenerateTip,
  completionCopy,
  completionStatus,
  onComplete,
  favoriteButton,
}: TipCardProps) {
  return (
    <article className="tip-card">
      <div className="tip-card-header">
        <span>{tip.category}</span>
        <span>{tip.effort}</span>
        {favoriteButton}
      </div>

      <h3 id="active-tip-title" tabIndex={-1}>{tip.title}</h3>
      <p>{tip.text}</p>

      <div className="quest-box">
        <p className="panel-label">{actionLabel}</p>
        <p>{tip.action}</p>
      </div>

      <div className="tip-actions">
        <button
          className="primary-button"
          onClick={onComplete}
          disabled={completionStatus !== null}
          type="button"
        >
          {completionStatus ? completionCopy.completed : completionCopy.button}
        </button>
        <button className="secondary-button" onClick={onGenerateTip} type="button">
          {completionStatus ? completionCopy.next : buttonLabel}
        </button>
      </div>
      <div className="completion-status" role="status" aria-atomic="true">
        {completionStatus && (
          <p>
            {completionCopy.confirmation}
            {completionStatus === "unsaved" && ` ${completionCopy.unsaved}`}
          </p>
        )}
      </div>
    </article>
  );
}
