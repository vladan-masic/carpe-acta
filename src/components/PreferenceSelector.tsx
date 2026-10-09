import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type PreferenceSelectorProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: ReadonlyArray<{ id: T; name: string; lang?: string }>;
  icon: ReactNode;
  onSelect: (value: T) => void;
};

export function PreferenceSelector<T extends string>({
  ariaLabel, value, options, icon, onSelect,
}: PreferenceSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const selectedOption = options[selectedIndex];

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

  function selectOption(nextValue: T) {
    onSelect(nextValue);
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
        nextIndex = (optionIndex + 1) % options.length;
        break;
      case "ArrowUp":
        nextIndex =
          (optionIndex - 1 + options.length) % options.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
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
    <div className="preference-selector" ref={selectorRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${ariaLabel}: ${selectedOption.name}`}
        className="preference-select-trigger"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        {icon}
        <span lang={selectedOption.lang}>{selectedOption.name}</span>
        <svg
          aria-hidden="true"
          className="preference-selector-chevron"
          fill="none"
          viewBox="0 0 12 8"
        >
          <path d="m1 1.25 5 5 5-5" />
        </svg>
      </button>

      {isOpen && (
        <div
          aria-label={ariaLabel}
          className="preference-options"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, optionIndex) => {
            const isSelected = option.id === value;

            return (
              <button
                aria-selected={isSelected}
                className="preference-option"
                key={option.id}
                lang={option.lang}
                onClick={() => selectOption(option.id)}
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
                  className="preference-option-check"
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
