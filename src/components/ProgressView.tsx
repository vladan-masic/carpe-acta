import { useRef, useState } from "react";
import { ActivityCalendar } from "./ActivityCalendar";
import { WhatHelpsMe } from "./WhatHelpsMe";
import { feedbackMessages } from "../i18n/feedback";
import type { Locale } from "../i18n/locales";
import { progressMessages } from "../i18n/progress";
import type { LocalizedTip } from "../types/tip";
import type { ProgressData } from "../utils/progress";

type Props = { progress: ProgressData | null; locale: Locale; tips: LocalizedTip[]; busy: boolean; onTry?: (tip: LocalizedTip) => void };
export function ProgressView({ progress, locale, tips, busy, onTry }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const historyHeading = useRef<HTMLHeadingElement>(null);
  const copy = progressMessages[locale];
  if (!progress) return <p role="status">{busy ? copy.loading : copy.unavailable}</p>;
  const byId = new Map<string, LocalizedTip>(tips.map((tip) => [tip.id, tip]));
  const total = progress.days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = progress.days.filter((day) => day.count > 0).length;
  const selectedDay = progress.calendar.find(day => day.date === selectedDate);
  const records = selectedDay ? selectedDay.records : progress.recent;
  const dayFormat = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const timeFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="progress-view" aria-busy={busy}>
      <p className="progress-week-summary">{copy.weekSummary(total, activeDays)}</p>
      <ActivityCalendar days={progress.calendar} locale={locale} selected={selectedDay?.date ?? null} onSelect={setSelectedDate} />
      <h3 ref={historyHeading} tabIndex={-1} aria-live="polite">{selectedDay ? `${dayFormat.format(new Date(selectedDay.date))} — ${copy.dayCount(selectedDay.count)}` : copy.recent}</h3>
      {selectedDay && <button className="secondary-button" type="button" onClick={() => { setSelectedDate(null); historyHeading.current?.focus(); }}>{copy.clearDay}</button>}
      {records.length === 0 ? <p>{selectedDay ? copy.emptyDay : copy.empty}</p> : <ol className="progress-recent">
        {records.map((record) => {
          const tip = byId.get(record.tipId);
          return <li key={record.id}>
            <div><h4>{tip?.title ?? copy.unknown}</h4>{tip && <p>{tip.action}</p>}{typeof record.feedback === "boolean" && <p className="progress-feedback">{record.feedback ? feedbackMessages[locale].yes : feedbackMessages[locale].no}</p>}</div>
            <time dateTime={record.completedAt}>{timeFormat.format(new Date(record.completedAt))}</time>
          </li>;
        })}
      </ol>}
      <WhatHelpsMe entries={progress.helpful} tips={tips} locale={locale} onTry={onTry} />
    </div>
  );
}
