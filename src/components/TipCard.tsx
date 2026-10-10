import { CategoryIcon } from "./CategoryIcon";
import type { Locale } from "../i18n/locales";
import { TipSources } from "./TipSources";
import type { LocalizedTip } from "../types/tip";
import type { CompletionStatus } from "../hooks/useTipCompletion";
import type { ReactNode } from "react";

type TipCardProps = {
  locale?: Locale;
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
  locale = "en",
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
    <article className="tip-card" aria-labelledby="active-tip-title" data-completion={completionStatus ?? "ready"}>
      <div className="tip-card-header">
        <span className="tip-category"><CategoryIcon category={tip.categoryId} />{tip.category}</span>
        <span className="tip-effort"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>{tip.effort}</span>
        {favoriteButton}
      </div>

      <div className="tip-story">
        <h3 id="active-tip-title" tabIndex={-1}>{tip.title}</h3>
        <p className="tip-introduction">{tip.text}</p>

        <div className="quest-box">
          <p className="panel-label">{actionLabel}<svg className="tip-pencil-stroke" viewBox="0 0 100 16" width="80" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 11c25-6 49-7 77-5M9 14c25-4 51-4 65-3m9-8 7 3-6 5" /></svg></p>
          <p>{tip.action}</p>
        </div>

      </div>
      <div className="tip-workflow">
        {timer}
        <div className="tip-actions tip-completion-actions">
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
        <div className="completion-status" role="status" aria-atomic="true">
          {completionStatus === "saving" ? <p>{savingLabel}</p> : completionStatus === "error" ? <p>{failedLabel}</p> : completionStatus && (
            <p>
              {completionCopy.confirmation}
              {completionStatus === "unsaved" && ` ${completionCopy.unsaved}`}
            </p>
          )}
        </div>
      </div>
      {feedback}
      {tip.whyItWorks?.trim() && (
        <details className="tip-explanation" key={tip.id}>
          <summary>{explanationLabel}</summary>
          <p>{tip.whyItWorks}</p>
        </details>
      )}
      <TipSources tipId={tip.id} locale={locale} />
    </article>
  );
}
