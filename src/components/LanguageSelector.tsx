import { localeOptions, type Locale } from "../i18n/locales";

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
  return (
    <div className="language-selector" aria-label={ariaLabel} role="group">
      {localeOptions.map((option) => (
        <button
          aria-pressed={locale === option.id}
          className="language-button"
          data-active={locale === option.id}
          key={option.id}
          lang={option.id}
          onClick={() => onSelectLocale(option.id)}
          type="button"
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}
