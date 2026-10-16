import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { SectionIcon } from "./SectionIcon";
import { CategoryIcon } from "./CategoryIcon";
import { NotebookEmptyState } from "./NotebookEmptyState";
import { TipSources } from "./TipSources";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { CategoryId, LocalizedTip, TipId } from "../types/tip";
import { FavoriteButton, type FavoriteLabels } from "./FavoriteButton";
import { tips as tipCatalog } from "../data/tips";
import type { Locale } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { favoritesSearchMessages } from "../i18n/favoritesSearch";
import { filterLibraryTips } from "../utils/tipLibrary";
import { ActionArtwork, artworkFamily } from "./ActionArtwork";

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
  onBrowse?: () => void;
};

export function FavoriteTips({ title, locale, disabled, loading, controls, description, emptyMessage, openLabel, actionLabel, labels, tips, onToggle, onOpen, onBrowse }: FavoriteTipsProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  const [viewAll, setViewAll] = useState(false);
  const [position, setPosition] = useState({ key: "", index: 0 });
  useEffect(() => {
    if (!window.matchMedia) return;
    const desktop = window.matchMedia("(min-width: 1100px)");
    const tablet = window.matchMedia("(min-width: 700px)");
    const update = () => setVisibleCount(desktop.matches ? 4 : tablet.matches ? 2 : 1);
    update();
    desktop.addEventListener?.("change", update); tablet.addEventListener?.("change", update);
    return () => { desktop.removeEventListener?.("change", update); tablet.removeEventListener?.("change", update); };
  }, []);
  const heading = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const copy = favoritesSearchMessages[locale];
  const filteredTips = filterLibraryTips(tips, query, category, null);
  const windowKey = JSON.stringify([query, category, locale, visibleCount]);
  if (position.key !== windowKey) setPosition({ key: windowKey, index: 0 });
  const maxStart = Math.max(0, filteredTips.length - visibleCount);
  const startIndex = position.key === windowKey ? Math.min(position.index, maxStart) : 0;
  const start = viewAll ? 0 : startIndex;
  const visibleTips = viewAll ? filteredTips : filteredTips.slice(start, start + visibleCount);
  const shelf = useRef<HTMLDivElement>(null);
  const previousWindow = useRef({ key: windowKey, start, viewAll });
  useLayoutEffect(() => {
    const previous = previousWindow.current;
    previousWindow.current = { key: windowKey, start, viewAll };
    if (previous.key !== windowKey || previous.viewAll !== viewAll || previous.start === start ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const animation = shelf.current?.animate?.([
      { transform: `translateX(${start > previous.start ? 8 : -8}px)`, opacity: 0.95 },
      { transform: "translateX(0)", opacity: 1 },
    ], { duration: 650, easing: "cubic-bezier(.25,.1,.25,1)" });
    return () => animation?.cancel();
  }, [windowKey, start, viewAll]);
  const swipe = useSwipeNavigation(!viewAll && maxStart > 0, direction => {
    setPosition({ key: windowKey, index: Math.max(0, Math.min(maxStart, startIndex + direction)) });
  });
  const hasFilters = query !== "" || category !== "all";
  return (
    <section className="favorites-section" id="favorites" aria-labelledby="favorites-title">
      <div className="section-heading">
        <h2 id="favorites-title" ref={heading} tabIndex={-1}><SectionIcon section="favorites" />{title} ({tips.length})</h2>
        <p>{description}</p>
        {filteredTips.length > visibleCount && <div className="favorites-navigation">
          <button className="secondary-button" type="button" aria-expanded={viewAll} aria-controls="favorite-cards" onClick={() => { setViewAll(!viewAll); setPosition({ key: windowKey, index: 0 }); }}>{viewAll ? copy.viewLess : copy.viewAll}</button>
        </div>}
      </div>
      {controls}
      {(tips.length > 0 || hasFilters) && <>
        <div className="library-filters favorites-filters" data-filtered={hasFilters}>
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
          {!loading && (viewAll || filteredTips.length <= visibleCount ? copy.results(visibleTips.length, tips.length) : copy.page(start + 1, start + visibleTips.length, filteredTips.length))}
        </p>
      </>}
      {tips.length === 0 ? !loading && <div className="saved-empty">
        <ActionArtwork scene="breathe" />
        <div><p className="saved-empty-title">{copy.invitation}</p><p>{emptyMessage}</p>
        {onBrowse && <button className="secondary-button" type="button" onClick={onBrowse}>{messages[locale].navigation.browse} <span aria-hidden="true">→</span></button>}</div>
      </div> : (
        filteredTips.length === 0 ? !loading && <NotebookEmptyState motif="page" message={copy.empty} /> :
        <div className="favorites-row" data-carousel={!viewAll && filteredTips.length > visibleCount}>
          {!viewAll && filteredTips.length > visibleCount && <button className="secondary-button favorites-arrow favorites-arrow--previous" type="button" aria-label={copy.previous} aria-controls="favorite-cards" disabled={startIndex === 0} onClick={() => setPosition({ key: windowKey, index: startIndex - 1 })}>‹</button>}
        <div ref={shelf} {...swipe} className="tips-grid saved-tip-shelf" id="favorite-cards" data-view-all={viewAll}>
          {visibleTips.map((tip, index) => (
            <article className="preview-card favorite-card collection-card" key={tip.id}>
              <div className="saved-tip-art" aria-hidden="true">{start + index === 0 || artworkFamily(filteredTips[start + index - 1].categoryId) !== artworkFamily(tip.categoryId)
                ? <ActionArtwork category={tip.categoryId} thumbnail /> : <CategoryIcon category={tip.categoryId} />}</div>
              <div className="library-tip-meta"><span className="collection-category"><CategoryIcon category={tip.categoryId} />{tip.category}</span><span className="collection-effort">{tip.effort}</span></div>
              <h3>{tip.title}</h3>
              <details className="saved-tip-details"><summary>{actionLabel}</summary>
              <p>{tip.text}</p>
              <div className="favorite-card-action">
                <strong>{actionLabel}</strong>
                <p>{tip.action}</p>
              </div>
              <TipSources tipId={tip.id} locale={locale} />
              </details>
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
          {!viewAll && filteredTips.length > visibleCount && <button className="secondary-button favorites-arrow favorites-arrow--next" type="button" aria-label={copy.next} aria-controls="favorite-cards" disabled={startIndex === maxStart} onClick={() => setPosition({ key: windowKey, index: startIndex + 1 })}>›</button>}
        </div>
      )}
    </section>
  );
}
