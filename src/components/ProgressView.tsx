import type { Locale } from "../i18n/locales";
import { progressMessages } from "../i18n/progress";
import type { LocalizedTip } from "../types/tip";
import type { ProgressData } from "../utils/progress";

type Props = { progress: ProgressData | null; locale: Locale; tips: LocalizedTip[]; busy: boolean };
export function ProgressView({ progress, locale, tips, busy }: Props) {
  const copy = progressMessages[locale];
  if (!progress) return <p role="status">{busy ? copy.loading : copy.unavailable}</p>;
  const byId = new Map<string, LocalizedTip>(tips.map((tip) => [tip.id, tip]));
  const total = progress.days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = progress.days.filter((day) => day.count > 0).length;
  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" });
  const timeFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="progress-view" aria-busy={busy}>
      <h3>{copy.week}</h3>
      <p className="progress-caption">{copy.timezone}</p>
      <dl className="progress-totals">
        <div><dt>{copy.total}</dt><dd>{total.toLocaleString(locale)}</dd></div>
        <div><dt>{copy.activeDays}</dt><dd>{activeDays.toLocaleString(locale)} / 7</dd></div>
      </dl>
      <ol className="progress-days">
        {progress.days.map((day, index) => <li key={day.date} className={day.count ? "progress-day active" : "progress-day"}>
          <time dateTime={day.date}>{index === 6 ? copy.today : dayFormat.format(new Date(day.date))}</time>
          <strong>{day.count.toLocaleString(locale)}</strong>
        </li>)}
      </ol>
      <h3>{copy.recent}</h3>
      {progress.recent.length === 0 ? <p>{copy.empty}</p> : <ol className="progress-recent">
        {progress.recent.map((record) => {
          const tip = byId.get(record.tipId);
          return <li key={record.id}>
            <div><h4>{tip?.title ?? copy.unknown}</h4>{tip && <p>{tip.action}</p>}</div>
            <time dateTime={record.completedAt}>{timeFormat.format(new Date(record.completedAt))}</time>
          </li>;
        })}
      </ol>}
    </div>
  );
}
