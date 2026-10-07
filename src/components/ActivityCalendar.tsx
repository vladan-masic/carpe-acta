import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Locale } from "../i18n/locales";
import { progressMessages } from "../i18n/progress";
import { activityLevel, type CalendarDay } from "../utils/progress";

type Props = { year?: number | null; today?: string; days: CalendarDay[]; locale: Locale; selected: string | null; onSelect: (date: string) => void };
export function ActivityCalendar({ days, locale, selected, onSelect, year = null, today }: Props) {
  const copy = progressMessages[locale];
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const leading = days.length ? (new Date(days[0].date).getDay() + 6) % 7 : 0;
  const weeks = year === null ? 12 : Math.ceil((leading + days.length) / 7);
  const slots = [...Array.from({ length: leading }, () => null), ...days];
  const title = year === null ? copy.calendar : `${copy.yearTitle} · ${year}`;
  const last = days.reduce((last, day, index) => day.future ? last : index, -1);
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
      case "Home": next = event.ctrlKey ? 0 : index - (index + leading) % 7; break;
      case "End": next = event.ctrlKey ? last : index - (index + leading) % 7 + 6; break;
      case "Escape": setPreview(null); return;
      default: return;
    }
    event.preventDefault();
    buttons.current[Math.max(0, Math.min(last, next))]?.focus();
  }
  return <section className="activity-calendar" aria-labelledby={`${id}-title`} onMouseLeave={() => setPreview(null)}>
    <h3 id={`${id}-title`}>{title}</h3>
    <p className="progress-caption" id={`${id}-hint`}>{copy.calendarHint}{year !== null && ` ${copy.yearHint}`}</p>
    <div className="calendar-scroll">
      <div className={`calendar-layout${year === null ? "" : " calendar-layout-year"}`} style={{ "--calendar-weeks": weeks } as CSSProperties}>
        <div className="calendar-months" aria-hidden="true">
          {Array.from({ length: weeks }, (_, week) => {
            const entries = slots.slice(week * 7, week * 7 + 7).filter((day): day is CalendarDay => day !== null);
            const start = entries.find(day => new Date(day.date).getDate() === 1) ?? (week === 0 ? entries[0] : null);
            return <span key={week}>{start ? month.format(new Date(start.date)) : ""}</span>;
          })}
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => <span key={index}>{index % 2 === 0 ? weekday.format(new Date(2026, 0, 5 + index)) : ""}</span>)}
        </div>
        <div className="calendar-squares" role="group" aria-label={title} aria-describedby={`${id}-hint`}>
          {Array.from({ length: leading }, (_, index) => <span key={`leading-${index}`} aria-hidden="true" />)}
          {days.map((day, index) => day.future ? <span key={day.date} className="calendar-future" aria-hidden="true" /> : <button key={day.date} type="button"
            className={`calendar-square activity-level-${activityLevel(day.count)}`}
            ref={element => { buttons.current[index] = element; }}
            aria-label={label(day)} aria-pressed={selected === day.date}
            aria-current={day.date === today ? "date" : undefined}
            tabIndex={index === tabIndex ? 0 : -1}
            onFocus={() => { setFocused(day.date); setPreview(day.date); }} onBlur={() => setPreview(null)}
            onMouseEnter={() => setPreview(day.date)}
            onKeyDown={event => navigate(event, index)}
            onClick={() => { setPreview(day.date); onSelect(day.date); }} />)}
          {Array.from({ length: weeks * 7 - leading - days.length }, (_, index) => <span key={`future-${index}`} className="calendar-future" aria-hidden="true" />)}
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
