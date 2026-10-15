import { NotebookEmptyState } from "./NotebookEmptyState";
import type { CalendarHistory } from "../hooks/useCalendarHistory";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ActivityCalendar } from "./ActivityCalendar";
import { WhatHelpsMe } from "./WhatHelpsMe";
import { feedbackMessages } from "../i18n/feedback";
import { whatHelpsMessages } from "../i18n/whatHelps";
import type { Locale } from "../i18n/locales";
import { progressMessages } from "../i18n/progress";
import type { LocalizedTip } from "../types/tip";
import { monthDays, type ProgressData } from "../utils/progress";

type Props = { weeklyGoal?: ReactNode; exploration?: ReactNode; achievements?: ReactNode; calendarHistory?: CalendarHistory; progress: ProgressData | null; locale: Locale; tips: LocalizedTip[]; busy: boolean; onTry?: (tip: LocalizedTip) => void };
export function ProgressView({ progress, locale, tips, busy, onTry, calendarHistory, achievements, weeklyGoal, exploration }: Props) {
  const [view, setView] = useState<"month" | "weeks" | "year">("month");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const requestedYear = view === "weeks" ? null : view === "month" ? month.getFullYear() : calendarHistory?.year ?? new Date().getFullYear();
  const setHistoryYear = calendarHistory?.setYear;
  useEffect(() => { setHistoryYear?.(requestedYear); }, [requestedYear, setHistoryYear]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyId = useId();
  const historyHeading = useRef<HTMLHeadingElement>(null);
  const copy = progressMessages[locale];
  if (!progress) return <div className="progress-view"><p role="status">{busy ? copy.loading : copy.unavailable}</p>{achievements}{exploration}</div>;
  const byId = new Map<string, LocalizedTip>(tips.map((tip) => [tip.id, tip]));
  const total = progress.days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = progress.days.filter((day) => day.count > 0).length;
  const year = view === "weeks" ? null : requestedYear;
  const awaitingYear = Boolean(calendarHistory && year !== null && calendarHistory.year !== year);
  const sourceDays = year === null || !calendarHistory ? progress.calendar : awaitingYear ? [] : calendarHistory.days ?? [];
  const calendar = view === "month" ? monthDays(sourceDays, month.getFullYear(), month.getMonth()) : sourceDays;
  function changeMonth(delta: number) {
    setSelectedDate(null);
    setMonth(current => { const next = new Date(current); next.setMonth(next.getMonth() + delta); return next; });
  }
  const selectedDay = calendar.find(day => day.date === selectedDate);
  const records = selectedDay ? selectedDay.records : progress.recent;
  const dayFormat = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const timeFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="progress-view" aria-busy={busy}>
      <div className="progress-overview">
      {weeklyGoal}
      <div className="calendar-journal" data-year={view === "year"}>
      <p className="progress-week-summary">{copy.weekSummary(total, activeDays)}</p>
      <div className="calendar-controls">
        <label>{copy.view} <select value={view} onChange={event => {
          setSelectedDate(null); setView(event.target.value as typeof view);
          calendarHistory?.setYear(event.target.value === "weeks" ? null : event.target.value === "month" ? month.getFullYear() : new Date().getFullYear());
        }}><option value="month">{copy.month}</option><option value="weeks">{copy.weeks}</option>{calendarHistory && <option value="year">{copy.year}</option>}</select></label>
        {view === "month" && <div className="calendar-month-controls">
          <button className="secondary-button" type="button" aria-label={copy.previousMonth} disabled={!calendarHistory || (month.getFullYear() <= 1 && month.getMonth() === 0)} onClick={() => changeMonth(-1)}>‹</button>
          <strong aria-live="polite">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}</strong>
          <button className="secondary-button" type="button" aria-label={copy.nextMonth} disabled={month.getFullYear() === new Date().getFullYear() && month.getMonth() >= new Date().getMonth()} onClick={() => changeMonth(1)}>›</button>
        </div>}
        {view === "year" && year !== null && <div className="calendar-year-controls">
          <button className="secondary-button" type="button" disabled={year <= 1} onClick={() => { setSelectedDate(null); calendarHistory?.setYear(year - 1); }}>{copy.previousYear}</button>
          <strong aria-live="polite">{year}</strong>
          <button className="secondary-button" type="button" disabled={year >= new Date().getFullYear()} onClick={() => { setSelectedDate(null); calendarHistory?.setYear(year + 1); }}>{copy.nextYear}</button>
        </div>}
      </div>
      {year !== null && (awaitingYear || calendarHistory?.loading) ? <p role="status">{copy.loadingYear}</p>
        : year !== null && calendarHistory?.error ? <div role="status"><p>{copy.yearError}</p><button type="button" className="secondary-button" onClick={calendarHistory.retry}>{copy.retryYear}</button></div>
        : <ActivityCalendar key={`${view}-${year}-${month.getMonth()}`} monthly={view === "month"} days={calendar} year={view === "year" ? year : null} today={progress.days[progress.days.length - 1]?.date} locale={locale} selected={selectedDay?.date ?? null} onSelect={date => { setSelectedDate(date); setHistoryOpen(true); }} /> }
      </div>
      {achievements}
      </div>
      {exploration}
      <div className="journal-details">
      <details className="history-disclosure" open={historyOpen} onToggle={event => setHistoryOpen(event.currentTarget.open)}>
      <summary>{copy.recent}</summary>
      <section className="history-journal" aria-labelledby={historyId}>
      <h3 id={historyId} ref={historyHeading} tabIndex={-1} aria-live="polite">{selectedDay ? `${dayFormat.format(new Date(selectedDay.date))} — ${copy.dayCount(selectedDay.count)}` : copy.recent}</h3>
      {selectedDay && <button className="secondary-button" type="button" onClick={() => { setSelectedDate(null); historyHeading.current?.focus(); }}>{copy.clearDay}</button>}
      {records.length === 0 ? <NotebookEmptyState className="history-empty" motif="path" message={selectedDay ? copy.emptyDay : copy.empty} /> : <ol className="progress-recent">
        {records.map((record) => {
          const tip = byId.get(record.tipId);
          return <li key={record.id}>
            <div><h4>{tip?.title ?? copy.unknown}</h4>{tip && <p>{tip.action}</p>}{typeof record.feedback === "boolean" && <p className="progress-feedback">{record.feedback ? feedbackMessages[locale].yes : feedbackMessages[locale].no}</p>}</div>
            <time dateTime={record.completedAt}>{timeFormat.format(new Date(record.completedAt))}</time>
          </li>;
        })}
      </ol>}
      </section>
      </details>
      <details className="reflection-disclosure"><summary>{whatHelpsMessages[locale].title}</summary>
      <WhatHelpsMe entries={progress.helpful} tips={tips} locale={locale} onTry={onTry} />
      </details>
      </div>
    </div>
  );
}
