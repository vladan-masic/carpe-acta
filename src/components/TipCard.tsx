import type { LocalizedTip } from "../types/tip";
import type { CompletionStatus } from "../hooks/useTipCompletion";
import type { ReactNode } from "react";

type TipCardProps = {
  actionLabel: string;
  explanationLabel: string;
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
  completionStatus: CompletionStatus;
  completionBusy: boolean;
  savingLabel: string;
  failedLabel: string;
  retryLabel: string;
  onRetry: () => void;
  onComplete: () => void;
  favoriteButton: ReactNode;
  feedback?: ReactNode;
  extraActions?: ReactNode;
  timer?: ReactNode;
};

export function TipCard({
  actionLabel,
  explanationLabel,
  buttonLabel,
  tip,
  onGenerateTip,
  completionCopy,
  completionStatus,
  completionBusy, savingLabel, failedLabel, retryLabel, onRetry,
  onComplete,
  favoriteButton, feedback, extraActions, timer,
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
          disabled={completionBusy || completionStatus !== null}
          type="button"
        >
          {completionStatus === "saving" ? savingLabel : completionStatus ? completionCopy.completed : completionCopy.button}
        </button>
        <button className="secondary-button" onClick={onGenerateTip} type="button">
          {completionStatus ? completionCopy.next : buttonLabel}
        </button>
        {extraActions}
        {completionStatus === "error" && <button type="button" className="secondary-button" disabled={completionBusy} onClick={onRetry}>{retryLabel}</button>}
      </div>
      {timer}
      <div className="completion-status" role="status" aria-atomic="true">
        {completionStatus === "saving" ? <p>{savingLabel}</p> : completionStatus === "error" ? <p>{failedLabel}</p> : completionStatus && (
          <p>
            {completionCopy.confirmation}
            {completionStatus === "unsaved" && ` ${completionCopy.unsaved}`}
          </p>
        )}
      </div>
      {feedback}
      {tip.whyItWorks?.trim() && (
        <details className="tip-explanation" key={tip.id}>
          <summary>{explanationLabel}</summary>
          <p>{tip.whyItWorks}</p>
        </details>
      )}
    </article>
  );
}
