import { startBarrierIds, type StartBarrier } from "../data/startBarriers";
import { helpMeStartMessages } from "../i18n/helpMeStart";
import type { Locale } from "../i18n/locales";

type Props = { locale: Locale; selected: StartBarrier | null; onSelect: (barrier: StartBarrier) => void };
export function HelpMeStart({ locale, selected, onSelect }: Props) {
  const copy = helpMeStartMessages[locale];
  return <div className="help-start-panel">
    <p>{copy.intro}</p>
    <fieldset className="help-start-choices">
      <legend>{copy.question}</legend>
      {startBarrierIds.map((barrier) => <button type="button" className="category-button" key={barrier}
        aria-pressed={selected === barrier} data-active={selected === barrier} onClick={() => onSelect(barrier)}>
        {copy.choices[barrier]}
      </button>)}
    </fieldset>
    <p role="status" aria-atomic="true">{selected ? `${copy.matched} ${copy.choices[selected]}` : copy.prompt}</p>
  </div>;
}
