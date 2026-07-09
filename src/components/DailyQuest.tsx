import type { Tip } from "../types/tip";

type DailyQuestProps = {
  quest: Tip;
};

export function DailyQuest({ quest }: DailyQuestProps) {
  return (
    <article className="daily-quest" aria-labelledby="daily-quest-title">
      <p className="panel-label">Today's Quest</p>
      <h2 id="daily-quest-title">{quest.title}</h2>
      <p>{quest.action}</p>
      <span>{quest.category}</span>
    </article>
  );
}
