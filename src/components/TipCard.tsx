import type { Tip } from "../types/tip";

type TipCardProps = {
  tip: Tip;
  onGenerateTip: () => void;
};

export function TipCard({ tip, onGenerateTip }: TipCardProps) {
  return (
    <article className="tip-card">
      <div className="tip-card-header">
        <span>{tip.category}</span>
        <span>{tip.effort}</span>
      </div>

      <h3>{tip.title}</h3>
      <p>{tip.text}</p>

      <div className="quest-box">
        <p className="panel-label">Do this now</p>
        <p>{tip.action}</p>
      </div>

      <button className="primary-button" onClick={onGenerateTip} type="button">
        Generate a New Quest
      </button>
    </article>
  );
}
