import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "../i18n/locales";
import { progressMessages } from "../i18n/progress";
import { activityLevel, type CalendarDay } from "../utils/progress";

type Props = { days: CalendarDay[]; locale: Locale; selected: string | null; onSelect: (date: string) => void };
export function ActivityCalendar({ days, locale, selected, onSelect }: Props) {
  const copy = progressMessages[locale];
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const last = days.length - 1;
  const focusIndex = Math.max(0, days.findIndex(day => day.date === focused));
  const tabIndex = focused && days.some(day => day.date === focused) ? focusIndex : last;
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const month = new Intl.DateTimeFormat(locale, { month: "short" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const label = (day: CalendarDay) => `${fullDate.format(new Date(day.date))} — ${copy.dayCount(day.count)}`;
  const previewDay = days.find(day => day.date === preview);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowUp": next = index - 1; break;
      case "ArrowDown": next = index + 1; break;
      case "ArrowLeft": next = index - 7; break;
      case "ArrowRight": next = index + 7; break;
      case "Home": next = event.ctrlKey ? 0 : index - index % 7; break;
      case "End": next = event.ctrlKey ? last : index - index % 7 + 6; break;
      case "Escape": setPreview(null); return;
      default: return;
    }
    event.preventDefault();
    buttons.current[Math.max(0, Math.min(last, next))]?.focus();
  }
  return <section className="activity-calendar" aria-labelledby={`${id}-title`} onMouseLeave={() => setPreview(null)}>
    <h3 id={`${id}-title`}>{copy.calendar}</h3>
    <p className="progress-caption" id={`${id}-hint`}>{copy.calendarHint}</p>
    <div className="calendar-scroll">
      <div className="calendar-layout">
        <div className="calendar-months" aria-hidden="true">
          {Array.from({ length: 12 }, (_, week) => {
            const entries = days.slice(week * 7, week * 7 + 7);
            const start = entries.find(day => new Date(day.date).getDate() === 1) ?? (week === 0 ? entries[0] : null);
            return <span key={week}>{start ? month.format(new Date(start.date)) : ""}</span>;
          })}
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {days.slice(0, 7).map((day, index) => <span key={day.date}>{index % 2 === 0 ? weekday.format(new Date(day.date)) : ""}</span>)}
        </div>
        <div className="calendar-squares" role="group" aria-label={copy.calendar} aria-describedby={`${id}-hint`}>
          {days.map((day, index) => <button key={day.date} type="button"
            className={`calendar-square activity-level-${activityLevel(day.count)}`}
            ref={element => { buttons.current[index] = element; }}
            aria-label={label(day)} aria-pressed={selected === day.date}
            aria-current={index === last ? "date" : undefined}
            tabIndex={index === tabIndex ? 0 : -1}
            onFocus={() => { setFocused(day.date); setPreview(day.date); }} onBlur={() => setPreview(null)}
            onMouseEnter={() => setPreview(day.date)}
            onKeyDown={event => navigate(event, index)}
            onClick={() => { setPreview(day.date); onSelect(day.date); }} />)}
          {Array.from({ length: 84 - days.length }, (_, index) => <span key={`future-${index}`} className="calendar-future" aria-hidden="true" />)}
        </div>
      </div>
    </div>
    <div className="calendar-legend"><span>{copy.less}</span>
      {[0, 1, 2, 3, 4].map(level => <span key={level} className={`calendar-swatch activity-level-${level}`} aria-hidden="true" />)}
      <span>{copy.more}</span><span className="calendar-scale">0 · 1 · 2 · 3–4 · 5+</span>
    </div>
    <p className="calendar-preview" role="tooltip">{previewDay ? label(previewDay) : "\u00a0"}</p>
  </section>;
}
