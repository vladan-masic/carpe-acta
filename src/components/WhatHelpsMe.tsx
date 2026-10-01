import { useState } from "react";
import type { Locale } from "../i18n/locales";
import { whatHelpsMessages } from "../i18n/whatHelps";
import type { HelpfulTip } from "../utils/helpfulTips";
import type { LocalizedTip } from "../types/tip";

type Props = { entries: HelpfulTip[]; tips: LocalizedTip[]; locale: Locale; onTry?: (tip: LocalizedTip) => void };
export function WhatHelpsMe({ entries, tips, locale, onTry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const copy = whatHelpsMessages[locale];
  const byId = new Map<string, LocalizedTip>(tips.map((tip) => [tip.id, tip]));
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return <section className="what-helps" aria-labelledby="what-helps-title">
    <h3 id="what-helps-title">{copy.title}</h3>
    <p>{copy.intro}</p>
    {entries.length === 0 ? <p>{copy.empty}</p> : <>
      <ul className="what-helps-list">
        {(expanded ? entries : entries.slice(0, 5)).map((entry) => {
          const tip = byId.get(entry.tipId);
          return <li key={entry.tipId}>
            <h4>{tip?.title ?? copy.unavailable}</h4>
            {tip && <p>{tip.action}</p>}
            <p>{copy.helpful}: <strong>{entry.helpfulCount.toLocaleString(locale)}</strong> · {copy.notHelpful}: <strong>{entry.notHelpfulCount.toLocaleString(locale)}</strong></p>
            <p>{copy.latest}: {entry.latest.helpful ? copy.helpful : copy.notHelpful} — <time dateTime={entry.latest.completedAt}>{dates.format(new Date(entry.latest.completedAt))}</time></p>
            {tip && onTry && <button className="secondary-button" type="button" onClick={() => onTry(tip)} aria-label={`${copy.retry}: ${tip.title}`}>{copy.retry}</button>}
          </li>;
        })}
      </ul>
      {entries.length > 5 && <button className="secondary-button" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? copy.showLess : copy.showAll}</button>}
    </>}
  </section>;
}
