import { AchievementStamp } from "./AchievementStamp";
import { CategoryIcon } from "./CategoryIcon";
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
    {!open && <div className="exploration-peek"><AchievementStamp kind="exploration" earned={count > 0} /><p>{categories === null ? copy.intro : <>{copy.count(count, explorationCategories.length)} <span>{next ? copy.next(next - count) : copy.complete}</span></>}</p></div>}
    <div id="exploration-content" hidden={!open}>
      <p>{copy.intro}</p>
      {categories === null ? <p role="status">{error ? <>{copy.error} <button type="button" className="secondary-button" onClick={retry}>{copy.retry}</button></> : copy.loading}</p> : <>
        <div className="exploration-overview"><AchievementStamp kind="exploration" earned={count > 0} /><div><p role="status">{copy.count(count, explorationCategories.length)} {next ? copy.next(next - count) : copy.complete}</p>
        {next && <progress aria-label={copy.title} max={next} value={count} />}</div></div>
        {earned.length > 0 && <ul role="list" className="exploration-badges">{earned.map(n => <li className="exploration-keepsake" key={n}><AchievementStamp kind="exploration" /><span>{copy.badge(n, n === explorationCategories.length)}</span></li>)}</ul>}
        {unexplored && <div className="exploration-next"><span className="category-marker is-ahead"><CategoryIcon category={unexplored} />{messages[locale].categories[unexplored]}</span><button type="button" className="secondary-button" onClick={() => onExplore(unexplored)}>{copy.discover}</button></div>}
        {count > 0 && <details><summary>{copy.categories}</summary><ul role="list" className="exploration-categories">{categories.map(category => <li className="category-marker is-discovered" key={category}><CategoryIcon category={category} />{messages[locale].categories[category]}</li>)}</ul></details>}
      </>}
    </div>
  </section>;
}
