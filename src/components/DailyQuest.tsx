import type { LocalizedTip } from "../types/tip";

type DailyQuestProps = {
  label: string;
  quest: LocalizedTip;
};

export function DailyQuest({ label, quest }: DailyQuestProps) {
  return (
    <article className="daily-quest" aria-labelledby="daily-quest-title">
      <p className="panel-label">{label}</p>
      <h2 id="daily-quest-title">{quest.title}</h2>
      <p>{quest.action}</p>
      <span>{quest.category}</span>
    </article>
  );
}
