import { useWeeklyAchievements } from "../hooks/useWeeklyAchievements";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "../i18n/locales";
import { weeklyGoalMessages } from "../i18n/weeklyGoal";
import { useWeeklyGoal } from "../hooks/useWeeklyGoal";
import { weeklyActivity, type ProgressData } from "../utils/progress";


type Props = { client: SupabaseClient | null; owner: string | null; progress: ProgressData; locale: Locale; busy: boolean };
export function WeeklyGoal({ client, owner, progress, locale, busy }: Props) {
  const goal = useWeeklyGoal(client, owner);
  const achievements = useWeeklyAchievements(client, owner, goal.target, !busy && !goal.loading && !goal.saving && !goal.error, progress.calendar);
  const copy = weeklyGoalMessages[locale];
  const days = weeklyActivity(progress.days);
  const active = days.filter(day => day.active).length;
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return <section className="weekly-goal" aria-labelledby="weekly-goal-title" aria-busy={goal.loading || goal.saving || busy}>
    <h3 id="weekly-goal-title">{copy.title}</h3>
    <p>{copy.hint}</p>
    <label>{copy.target} <select value={goal.target} disabled={goal.loading || goal.saving} onChange={event => void goal.save(Number(event.target.value))}>
      <option value={0}>{copy.off}</option>
      {Array.from({ length: 7 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n === 3 ? copy.suggested : copy.days(n)}</option>)}
    </select></label>
    <p className="weekly-goal-storage">{goal.loading ? copy.loading : goal.saving ? copy.saving : goal.error ? "" : owner ? copy.account : copy.browser}</p>
    {goal.error && <p role="alert">{copy.error}</p>}
    {goal.target > 0 && <>
      <p role="status">{copy.progress(active, goal.target)} {active >= goal.target && copy.reached}</p>
      <progress max={goal.target} value={Math.min(active, goal.target)} aria-label={copy.title} />
      <div className="weekly-goal-days">{days.map(day => <span role="img" key={day.date.toISOString()} className={day.active ? "is-active" : ""} aria-label={`${fullDate.format(day.date)} — ${day.active ? copy.active : day.future ? copy.future : copy.inactive}`} title={`${fullDate.format(day.date)} — ${day.active ? copy.active : day.future ? copy.future : copy.inactive}`}>
        <span aria-hidden="true">{weekday.format(day.date)}<br />{day.active ? "✓" : "·"}</span>
      </span>)}</div>
    </>}
    <div className="weekly-achievements">
      <h4>{copy.achievements}</h4>
      <p>{copy.achievementHint}</p>
      {achievements.error ? <p role="alert">{copy.achievementError} <button type="button" className="secondary-button" onClick={achievements.retry}>{copy.retryAchievements}</button></p>
        : achievements.records === null ? <p>{copy.loadingAchievements}</p> : <>
          <p>{copy.weeksMet(achievements.records.length)}</p>
          {achievements.records.length > 0 && <details><summary>{copy.achievementHistory}</summary>
            <ul>{achievements.records.map(record => <li key={record.week}>
              {copy.achievedWeek(new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${record.week}T12:00:00`)), record.target)}
            </li>)}</ul>
          </details>}
        </>}
    </div>
  </section>;
}
