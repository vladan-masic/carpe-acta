import { useRef, type ReactNode } from "react";
import type { LocalizedTip, TipId } from "../types/tip";
import { FavoriteButton, type FavoriteLabels } from "./FavoriteButton";

type FavoriteTipsProps = {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  controls?: ReactNode;
  description: string;
  emptyMessage: string;
  openLabel: string;
  actionLabel: string;
  labels: FavoriteLabels;
  tips: LocalizedTip[];
  onToggle: (id: TipId) => void;
  onOpen: (tip: LocalizedTip) => void;
};

export function FavoriteTips({ title, disabled, loading, controls, description, emptyMessage, openLabel, actionLabel, labels, tips, onToggle, onOpen }: FavoriteTipsProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <section className="favorites-section" id="favorites" aria-labelledby="favorites-title">
      <div className="section-heading">
        <h2 id="favorites-title" ref={heading} tabIndex={-1}>{title} ({tips.length})</h2>
        <p>{description}</p>
      </div>
      {controls}
      {tips.length === 0 ? !loading && <p className="favorites-empty">{emptyMessage}</p> : (
        <div className="tips-grid">
          {tips.map((tip) => (
            <article className="preview-card favorite-card" key={tip.id}>
              <span>{tip.category}</span>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
              <div className="favorite-card-action">
                <strong>{actionLabel}</strong>
                <p>{tip.action}</p>
              </div>
              <div className="tip-actions">
                <button className="secondary-button" type="button" onClick={() => onOpen(tip)}>
                  {openLabel}
                </button>
                <FavoriteButton
                  selected
                  disabled={disabled}
                  title={tip.title}
                  labels={labels}
                  onToggle={() => {
                    onToggle(tip.id);
                    // The removed card unmounts; keep keyboard focus in the collection.
                    heading.current?.focus({ preventScroll: true });
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
