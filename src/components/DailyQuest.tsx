import { CategoryIcon } from "./CategoryIcon";
import type { Locale } from "../i18n/locales";
import { TipSources } from "./TipSources";
import type { LocalizedTip } from "../types/tip";
import type { ReactNode } from "react";

type DailyQuestProps = {
  locale?: Locale;
  label: string;
  quest: LocalizedTip;
  favoriteButton: ReactNode;
};

export function DailyQuest({ label, quest, favoriteButton, locale = "en" }: DailyQuestProps) {
  return (
    <article className="daily-quest" aria-labelledby="daily-quest-title">
      <div className="daily-quest-heading">
        <svg className="daily-stamp" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 3" />
          <path d="M9 25h22 M13 23a7 7 0 0 1 14 0 M20 9v4 M10 14l3 3 M30 14l-3 3 M8 21h3 M29 21h3" />
        </svg>
        <p className="panel-label">{label}</p>
      </div>
      <h2 id="daily-quest-title">{quest.title}</h2>
      <p>{quest.action}</p>
      <div className="daily-quest-meta">
        <span className="daily-category"><CategoryIcon category={quest.categoryId} />{quest.category}</span>
        {favoriteButton}
      </div>
      <TipSources tipId={quest.id} locale={locale} />
    </article>
  );
}
