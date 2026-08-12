import type { ChangeEvent } from "react";
import { isLocale, localeOptions, type Locale } from "../i18n/locales";

type LanguageSelectorProps = {
  ariaLabel: string;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
};

export function LanguageSelector({
  ariaLabel,
  locale,
  onSelectLocale,
}: LanguageSelectorProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    if (isLocale(nextLocale)) {
      onSelectLocale(nextLocale);
    }
  }

  return (
    <label className="language-selector">
      <span className="visually-hidden">{ariaLabel}</span>
      <select
        aria-label={ariaLabel}
        className="language-select"
        onChange={handleChange}
        value={locale}
      >
        {localeOptions.map((option) => (
          <option key={option.id} lang={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
