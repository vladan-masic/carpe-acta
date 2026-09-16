import type { LocalizedTip, Tip } from "../types/tip";
import type { Locale } from "./locales";
import { messages } from "./messages";
import { tipTranslations } from "./tips";

export function localizeTip(tip: Tip, locale: Locale): LocalizedTip {
  const copy = messages[locale];

  return {
    ...tip,
    ...tipTranslations[locale][tip.id],
    category: copy.categories[tip.categoryId],
    effort: copy.formatEffort(tip.effortMinutes),
  };
}
