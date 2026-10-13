import actions from "../assets/illustrations/stamp-completed-actions.webp";
import days from "../assets/illustrations/stamp-active-days.webp";
import best from "../assets/illustrations/stamp-personal-best.webp";
import exploration from "../assets/illustrations/stamp-category-exploration.webp";

type Props = { kind: "actions" | "days" | "best" | "exploration"; earned?: boolean };
const artwork = { actions, days, best, exploration };

// Painted keepsakes are decorative. The adjacent localized text always states
// the actual earned status and threshold; unearned art retains its warm colours.
export function AchievementStamp({ kind, earned = true }: Props) {
  return <img className={`achievement-stamp stamp-${kind}${earned ? "" : " stamp-ahead"}`}
    src={artwork[kind]} width="240" height="180" alt="" aria-hidden="true" loading="lazy" decoding="async" />;
}
