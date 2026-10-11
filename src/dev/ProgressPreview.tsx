import { useState } from "react";
import { WeeklyGoal } from "../components/WeeklyGoal";
import { ProgressView } from "../components/ProgressView";
import { useCalendarHistory } from "../hooks/useCalendarHistory";
import { summarizeProgress } from "../utils/progress";
import { tips } from "../data/tips";
import { localizeTip } from "../i18n/localizeTip";
import type { Locale } from "../i18n/locales";

// Real components and calculations with in-memory records. Use a dedicated
// preview origin: WeeklyGoal still exercises its normal browser preferences.
export function ProgressPreview() {
  const [locale, setLocale] = useState<Locale>("en");
  const [empty, setEmpty] = useState(false);
  const [extra, setExtra] = useState(false);
  const [now] = useState(() => new Date());
  const date = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 9).toISOString();
  const samples = [0, 0, 2, 4, 6, 28].map((offset, index) => ({ id: `sample-${index}`, tipId: tips[index].id, completedAt: date(offset), feedback: index % 2 === 0 }));
  const records = empty ? [] : [...samples, { id: "retired", tipId: "retired-example", completedAt: date(35) },
    { id: "previous-year", tipId: tips[0].id, completedAt: new Date(now.getFullYear() - 1, 5, 12, 10).toISOString() },
    ...(extra ? [{ id: "extra", tipId: tips[6].id, completedAt: date(0) }] : [])];
  const progress = summarizeProgress(records, now);
  const calendar = useCalendarHistory({ client: null, owner: null, loading: false, busy: false, guest: { records, readable: true }, progress });
  return <main className="app-shell">
    <h1>Activity journal · visual review</h1>
    <p>Sample activity, not your records. Goal settings and achieved weeks use this preview origin’s browser storage. No account connection.</p>
    <div className="calendar-controls">
      <label>Language <select value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="en">English</option><option value="sr-Latn">Srpski</option></select></label>
      <label>Theme <select defaultValue="light" onChange={event => { document.documentElement.dataset.theme = event.target.value; }}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <button className="secondary-button" onClick={() => setEmpty(!empty)}>{empty ? "Restore sample history" : "Empty history"}</button>
      <button className="secondary-button" onClick={() => setExtra(!extra)}>{extra ? "Undo sample action" : "Add sample action"}</button>
    </div>
    <WeeklyGoal client={null} owner={null} locale={locale} progress={progress} busy={false} />
    <ProgressView progress={progress} locale={locale} tips={tips.map(tip => localizeTip(tip, locale))} busy={false} calendarHistory={calendar} />
  </main>;
}
