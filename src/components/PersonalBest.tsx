import type { Locale } from "../i18n/locales";
import { personalBestMessages } from "../i18n/personalBests";
import type { PersonalBest as Best } from "../utils/personalBests";

type Props = { best: Best | null; error: boolean; retry: () => void; locale: Locale };

export function PersonalBest({ best, error, retry, locale }: Props) {
  const copy = personalBestMessages[locale];
  const week = best?.week ? new Date(`${best.week}T12:00:00`).toLocaleDateString(locale, {
    day: "numeric", month: locale === "sr-Latn" ? "numeric" : "long", year: "numeric",
  }) : null;
  return <section className="personal-milestones" aria-labelledby="personal-best-title">
    <h3 id="personal-best-title">{copy.title}</h3>
    <p>{copy.label}</p>
    <div role="status">
      {!best ? <p>{error ? copy.error : copy.loading}</p> : best.days === 0 ? <p>{copy.empty}</p> : <>
        <p><span className="milestone-badge">{copy.days(best.days)}</span></p>
        <p>{copy.week(week!)}</p>
      </>}
    </div>
    {!best && error && <button type="button" className="secondary-button" onClick={retry}>{copy.retry}</button>}
    <p>{copy.hint}</p>
  </section>;
}
