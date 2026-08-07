import type { LocalizedTip } from "../types/tip";

type TipCardProps = {
  actionLabel: string;
  buttonLabel: string;
  tip: LocalizedTip;
  onGenerateTip: () => void;
};

export function TipCard({
  actionLabel,
  buttonLabel,
  tip,
  onGenerateTip,
}: TipCardProps) {
  return (
    <article className="tip-card">
      <div className="tip-card-header">
        <span>{tip.category}</span>
        <span>{tip.effort}</span>
      </div>

      <h3>{tip.title}</h3>
      <p>{tip.text}</p>

      <div className="quest-box">
        <p className="panel-label">{actionLabel}</p>
        <p>{tip.action}</p>
      </div>

      <button className="primary-button" onClick={onGenerateTip} type="button">
        {buttonLabel}
      </button>
    </article>
  );
}
