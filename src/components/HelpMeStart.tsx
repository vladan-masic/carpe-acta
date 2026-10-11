import { CategoryIcon } from "./CategoryIcon";
import { startBarriers, startBarrierIds, startTimeBudgets, type StartTimeBudget, type StartBarrier } from "../data/startBarriers";
import { helpMeStartMessages } from "../i18n/helpMeStart";
import type { Locale } from "../i18n/locales";

type Props = { locale: Locale; selected: StartBarrier | null; onSelect: (barrier: StartBarrier) => void; timeBudget: StartTimeBudget | null; onTimeSelect: (budget: StartTimeBudget | null) => void; hasSuggestion: boolean };
export function HelpMeStart({ locale, selected, onSelect, timeBudget, onTimeSelect, hasSuggestion }: Props) {
  const copy = helpMeStartMessages[locale];
  return <div className="help-start-panel">
    <div className="help-start-intro"><p>{copy.intro}</p><span className="help-start-sketch" aria-hidden="true" /></div>
    <fieldset className="help-start-choices help-start-barriers">
      <legend>{copy.question}</legend>
      {startBarrierIds.map((barrier) => <button type="button" className="category-button" key={barrier}
        aria-pressed={selected === barrier} data-active={selected === barrier} onClick={() => onSelect(barrier)}>
        <CategoryIcon category={startBarriers[barrier][0]} /><span>{copy.choices[barrier]}</span><span className="help-choice-check" aria-hidden="true">{selected === barrier ? "✓" : ""}</span>
      </button>)}
    </fieldset>
    <fieldset className="help-start-choices help-start-time">
      <legend>{copy.timeQuestion}</legend>
      {[null, ...startTimeBudgets].map((budget) => <button type="button" className="category-button" key={budget ?? "default"}
        aria-pressed={timeBudget === budget} data-active={timeBudget === budget} onClick={() => onTimeSelect(budget)}>
        {budget === null ? copy.noPreference : copy.minutes[budget]}
      </button>)}
    </fieldset>
    <p className="help-start-response" role="status" aria-atomic="true">{selected ? (hasSuggestion ? `${copy.matched} ${copy.choices[selected]}` : copy.empty) : copy.prompt}</p>
  </div>;
}
