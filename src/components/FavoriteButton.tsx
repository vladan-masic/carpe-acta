export type FavoriteLabels = {
  save: string;
  saved: string;
  toggle: string;
};

type FavoriteButtonProps = {
  selected: boolean;
  disabled?: boolean;
  title: string;
  labels: FavoriteLabels;
  onToggle: () => void;
};

export function FavoriteButton({ selected, disabled, title, labels, onToggle }: FavoriteButtonProps) {
  return (
    <button
      className="favorite-button"
      type="button"
      aria-pressed={selected}
      aria-label={`${labels.toggle}: ${title}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"
          fill={selected ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      {selected ? labels.saved : labels.save}
    </button>
  );
}
