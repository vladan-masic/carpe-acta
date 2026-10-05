import { useRef, useState, type ReactNode } from "react";
import type { CategoryId, LocalizedTip, TipId } from "../types/tip";
import { FavoriteButton, type FavoriteLabels } from "./FavoriteButton";
import { tips as tipCatalog } from "../data/tips";
import type { Locale } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { favoritesSearchMessages } from "../i18n/favoritesSearch";
import { filterLibraryTips } from "../utils/tipLibrary";

// Keep choices stable when favorites are removed or refreshed from an account.
const categoryIds = Array.from(new Set(tipCatalog.map((tip) => tip.categoryId)));

type FavoriteTipsProps = {
  title: string;
  locale: Locale;
  disabled?: boolean;
  loading?: boolean;
  controls?: ReactNode;
  description: ReactNode;
  emptyMessage: string;
  openLabel: string;
  actionLabel: string;
  labels: FavoriteLabels;
  tips: LocalizedTip[];
  onToggle: (id: TipId) => void;
  onOpen: (tip: LocalizedTip) => void;
};

export function FavoriteTips({ title, locale, disabled, loading, controls, description, emptyMessage, openLabel, actionLabel, labels, tips, onToggle, onOpen }: FavoriteTipsProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const copy = favoritesSearchMessages[locale];
  const filteredTips = filterLibraryTips(tips, query, category, null);
  const hasFilters = query !== "" || category !== "all";
  return (
    <section className="favorites-section" id="favorites" aria-labelledby="favorites-title">
      <div className="section-heading">
        <h2 id="favorites-title" ref={heading} tabIndex={-1}>{title} ({tips.length})</h2>
        <p>{description}</p>
      </div>
      {controls}
      {(tips.length > 0 || hasFilters) && <>
        <div className="library-filters favorites-filters">
          <label>{copy.search}
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>{copy.category}
            <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
              <option value="all">{copy.all}</option>
              {categoryIds.map((id) => <option key={id} value={id}>{messages[locale].categories[id]}</option>)}
            </select>
          </label>
        </div>
        <button className="secondary-button" type="button" onClick={() => { setQuery(""); setCategory("all"); }}>{copy.reset}</button>
        <p className="library-result-count" role="status" aria-atomic="true">
          {!loading && copy.results(filteredTips.length, tips.length)}
        </p>
      </>}
      {tips.length === 0 ? !loading && <p className="favorites-empty">{emptyMessage}</p> : (
        filteredTips.length === 0 ? !loading && <p className="favorites-empty">{copy.empty}</p> :
        <div className="tips-grid">
          {filteredTips.map((tip) => (
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
