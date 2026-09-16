import type { TipId, TipTranslation } from "../../types/tip";
import type { Locale } from "../locales";
import { enTips } from "./en";
import { srLatnTips } from "./sr-Latn";

export const tipTranslations: Record<Locale, Record<TipId, TipTranslation>> = {
  en: enTips,
  "sr-Latn": srLatnTips,
};
