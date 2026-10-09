import { useId, useRef, useState } from "react";
import type { Locale } from "../i18n/locales";
import { whatHelpsMessages } from "../i18n/whatHelps";
import type { LocalizedTip } from "../types/tip";
import type { HelpfulTip } from "../utils/helpfulTips";

const messages = {
  en: { open: "Try something that helped before", intro: "Choose an action you’ve marked as helpful, most recently helpful first." },
  "sr-Latn": { open: "Probaj nešto što ti je ranije pomoglo", intro: "Izaberi radnju koju si označio/la kao korisnu, počev od one koja je najskorije pomogla." },
};

type Props = { entries: HelpfulTip[]; tips: LocalizedTip[]; locale: Locale; onTry: (tip: LocalizedTip) => void };
export function HelpfulActionPicker({ entries, tips, locale, onTry }: Props) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const copy = messages[locale];
  const historyCopy = whatHelpsMessages[locale];
  const byId = new Map<string, LocalizedTip>(tips.map(tip => [tip.id, tip]));
  // Keep the existing helpful-history order; retired tips cannot be retried.
  const available = entries.flatMap(entry => {
    const tip = byId.get(entry.tipId);
    return tip ? [tip] : [];
  });
  if (!available.length) return null;
  return <>
    <button ref={trigger} type="button" className="secondary-button" aria-expanded={open}
      aria-controls={id} onClick={() => { setOpen(!open); setShowAll(false); }}>{copy.open}</button>
    {open && <section id={id} className="helpful-action-picker" aria-label={copy.open}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}>
      <p>{copy.intro}</p>
      <ul>
        {(showAll ? available : available.slice(0, 5)).map(tip => <li key={tip.id}>
          <button type="button" className="secondary-button" onClick={() => { setOpen(false); setShowAll(false); onTry(tip); }}>
            {tip.title}
          </button>
          <p>{tip.action}</p>
        </li>)}
      </ul>
      {available.length > 5 && <button type="button" className="secondary-button" aria-expanded={showAll}
        onClick={() => setShowAll(!showAll)}>{showAll ? historyCopy.showLess : historyCopy.showAll}</button>}
    </section>}
  </>;
}
