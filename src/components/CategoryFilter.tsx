import type { CategoryId } from "../types/tip";

export type CategoryFilterValue = "all" | CategoryId;

type CategoryOption = {
  id: CategoryFilterValue;
  label: string;
};

type CategoryFilterProps = {
  ariaLabel: string;
  categories: CategoryOption[];
  selectedCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
};

export function CategoryFilter({
  ariaLabel,
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="category-filter" aria-label={ariaLabel}>
      {categories.map((category) => (
        <button
          className="category-button"
          data-active={selectedCategory === category.id}
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
