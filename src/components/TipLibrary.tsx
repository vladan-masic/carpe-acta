import { useEffect, useState, type ReactNode } from "react";
import type { CategoryId, LocalizedTip } from "../types/tip";
import type { Locale } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { tipLibraryMessages } from "../i18n/tipLibrary";
import { filterLibraryTips } from "../utils/tipLibrary";

type TipLibraryProps = {
  categoryRequest?: { category: CategoryId; id: number } | null;
  tips: LocalizedTip[];
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderFavoriteButton: (tip: LocalizedTip) => ReactNode;
  onTry: (tip: LocalizedTip) => void;
};
const PAGE_SIZE = 6;

export function TipLibrary({ tips, locale, open, onOpenChange, renderFavoriteButton, onTry, categoryRequest }: TipLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const [maxEffort, setMaxEffort] = useState<number | null>(null);
  const [page, setPage] = useState({ key: "", count: PAGE_SIZE });
  useEffect(() => {
    if (!categoryRequest) return;
    setQuery(""); setCategory(categoryRequest.category); setMaxEffort(null);
    const frame = requestAnimationFrame(() => {
      document.getElementById("tip-library-search")?.focus({ preventScroll: true });
      document.getElementById("tip-library-title")?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [categoryRequest]);
  const copy = tipLibraryMessages[locale];
  const common = messages[locale];
  const results = filterLibraryTips(tips, query, category, maxEffort);
  const key = JSON.stringify([locale, query, category, maxEffort]);
  // Reset pagination for each new search, including a language change.
  if (page.key !== key) setPage({ key, count: PAGE_SIZE });
  const limit = page.key === key ? page.count : PAGE_SIZE;
  const visible = results.slice(0, limit);
  const categories = Array.from(new Set(tips.map((tip) => tip.categoryId)));
  const efforts = Array.from(new Set(tips.map((tip) => tip.effortMinutes))).sort((a, b) => a - b);

  return (
    <section className="tip-library" aria-labelledby="tip-library-title">
      <h2 id="tip-library-title">
        <button className="secondary-button" type="button" aria-expanded={open}
          aria-controls="tip-library-content" onClick={() => onOpenChange(!open)}>{copy.title}</button>
      </h2>
      <div id="tip-library-content" hidden={!open}>
        <p>{copy.intro}</p>
        <div className="library-filters">
          <label>{copy.search}
            <input id="tip-library-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>{copy.category}
            <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
              <option value="all">{common.generator.allCategories}</option>
              {categories.map((id) => <option key={id} value={id}>{common.categories[id]}</option>)}
            </select>
          </label>
          <label>{copy.effort}
            <select value={maxEffort ?? ""} onChange={(event) => setMaxEffort(event.target.value ? Number(event.target.value) : null)}>
              <option value="">{copy.anyEffort}</option>
              {efforts.map((minutes) => <option key={minutes} value={minutes}>{copy.upTo(minutes)}</option>)}
            </select>
          </label>
        </div>
        <button className="secondary-button" type="button" onClick={() => {
          setQuery(""); setCategory("all"); setMaxEffort(null); setPage({ key: "", count: PAGE_SIZE });
        }}>{copy.reset}</button>
        <p className="library-result-count" role="status" aria-atomic="true">{copy.results(visible.length, results.length)}</p>
        {results.length === 0 ? <p className="favorites-empty">{copy.empty}</p> : (
          <div className="tips-grid">
            {visible.map((tip) => (
              <article className="preview-card favorite-card" key={tip.id} aria-labelledby={`library-${tip.id}`}>
                <div className="library-tip-meta"><span>{tip.category}</span><span>{tip.effort}</span></div>
                <h3 id={`library-${tip.id}`} tabIndex={-1}>{tip.title}</h3>
                <p>{tip.text}</p>
                <div className="favorite-card-action"><strong>{common.generator.actionLabel}</strong><p>{tip.action}</p></div>
                <div className="tip-actions">
                  <button className="secondary-button" type="button" aria-label={`${copy.try}: ${tip.title}`} onClick={() => onTry(tip)}>{copy.try}</button>
                  {renderFavoriteButton(tip)}
                </div>
              </article>
            ))}
          </div>
        )}
        {visible.length < results.length && <button className="secondary-button library-more" type="button" onClick={() => {
          const nextTip = results[visible.length];
          setPage({ key, count: limit + PAGE_SIZE });
          requestAnimationFrame(() => document.getElementById(`library-${nextTip.id}`)?.focus());
        }}>{copy.more}</button>}
      </div>
    </section>
  );
}
