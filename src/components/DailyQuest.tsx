import type { LocalizedTip } from "../types/tip";
import type { ReactNode } from "react";

type DailyQuestProps = {
  label: string;
  quest: LocalizedTip;
  favoriteButton: ReactNode;
};

export function DailyQuest({ label, quest, favoriteButton }: DailyQuestProps) {
  return (
    <article className="daily-quest" aria-labelledby="daily-quest-title">
      <p className="panel-label">{label}</p>
      <h2 id="daily-quest-title">{quest.title}</h2>
      <p>{quest.action}</p>
      <span>{quest.category}</span>
      {favoriteButton}
    </article>
  );
}
