import type { CategoryId } from "../types/tip";
import type { Locale } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { explorationMessages } from "../i18n/categoryExploration";
import { explorationCategories, explorationTargets } from "../utils/categoryExploration";
type Props = { locale: Locale; open: boolean; onOpenChange: (open: boolean) => void; categories: CategoryId[] | null; error: boolean; retry: () => void; onExplore: (category: CategoryId) => void };
export function CategoryExploration({ locale, open, onOpenChange, categories, error, retry, onExplore }: Props) {
  const copy = explorationMessages[locale];
  const count = categories?.length ?? 0;
  const next = explorationTargets.find(n => n > count);
  const earned = explorationTargets.filter(n => n <= count);
  const unexplored = explorationCategories.find(category => !categories?.includes(category));
  return <section className="category-exploration" aria-labelledby="exploration-title">
    <h3 id="exploration-title"><button type="button" className="secondary-button" aria-expanded={open} aria-controls="exploration-content" onClick={() => onOpenChange(!open)}>{copy.title}</button></h3>
    <div id="exploration-content" hidden={!open}>
      <p>{copy.intro}</p>
      {categories === null ? <p role="status">{error ? <>{copy.error} <button type="button" className="secondary-button" onClick={retry}>{copy.retry}</button></> : copy.loading}</p> : <>
        <p role="status">{copy.count(count, explorationCategories.length)} {next ? copy.next(next - count) : copy.complete}</p>
        {next && <progress aria-label={copy.title} max={next} value={count} />}
        {earned.length > 0 && <ul className="exploration-badges">{earned.map(n => <li className="milestone-badge" key={n}><span aria-hidden="true">✦ </span>{copy.badge(n, n === explorationCategories.length)}</li>)}</ul>}
        {unexplored && <button type="button" className="secondary-button" onClick={() => onExplore(unexplored)}>{copy.discover}</button>}
        {count > 0 && <details><summary>{copy.categories}</summary><ul>{categories.map(category => <li key={category}>{messages[locale].categories[category]}</li>)}</ul></details>}
      </>}
    </div>
  </section>;
}
