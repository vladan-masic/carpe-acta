import { annotations } from "../i18n/annotations";
import type { Locale } from "../i18n/locales";

export function HandwrittenNote({ locale, placement }: { locale: Locale; placement: keyof typeof annotations.en }) {
  return <p className={`handwritten-note handwritten-note--${placement}`} lang={locale}>{annotations[locale][placement]}</p>;
}
