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
          d="M6 3h12v18l-6-4-6 4V3Z"
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
