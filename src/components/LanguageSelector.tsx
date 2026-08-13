import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = localeOptions.findIndex((option) => option.id === locale);
  const selectedOption = localeOptions[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    optionRefs.current[selectedIndex]?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, selectedIndex]);

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu({ restoreFocus = false } = {}) {
    setIsOpen(false);

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function selectLocale(nextLocale: Locale) {
    onSelectLocale(nextLocale);
    closeMenu({ restoreFocus: true });
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    optionIndex: number,
  ) {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowDown":
        nextIndex = (optionIndex + 1) % localeOptions.length;
        break;
      case "ArrowUp":
        nextIndex =
          (optionIndex - 1 + localeOptions.length) % localeOptions.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = localeOptions.length - 1;
        break;
      case "Escape":
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      case "Tab":
        closeMenu();
        return;
      default:
        return;
    }

    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="language-selector" ref={selectorRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${ariaLabel}: ${selectedOption.name}`}
        className="language-select-trigger"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="language-selector-icon"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.75 12h16.5M12 3.5c2.15 2.3 3.25 5.13 3.25 8.5S14.15 18.2 12 20.5C9.85 18.2 8.75 15.37 8.75 12S9.85 5.8 12 3.5Z" />
        </svg>
        <span lang={selectedOption.id}>{selectedOption.name}</span>
        <svg
          aria-hidden="true"
          className="language-selector-chevron"
          fill="none"
          viewBox="0 0 12 8"
        >
          <path d="m1 1.25 5 5 5-5" />
        </svg>
      </button>

      {isOpen && (
        <div
          aria-label={ariaLabel}
          className="language-options"
          id={listboxId}
          role="listbox"
        >
          {localeOptions.map((option, optionIndex) => {
            const isSelected = option.id === locale;

            return (
              <button
                aria-selected={isSelected}
                className="language-option"
                key={option.id}
                lang={option.id}
                onClick={() => selectLocale(option.id)}
                onKeyDown={(event) =>
                  handleOptionKeyDown(event, optionIndex)
                }
                ref={(element) => {
                  optionRefs.current[optionIndex] = element;
                }}
                role="option"
                type="button"
              >
                <span>{option.name}</span>
                <svg
                  aria-hidden="true"
                  className="language-option-check"
                  fill="none"
                  viewBox="0 0 12 10"
                >
                  <path d="m1 5 3.25 3.25L11 1.5" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
