import { CategoryIcon } from "./CategoryIcon";
import { useId, useState } from "react";
import type { CategoryId } from "../types/tip";

export type CategoryFilterValue = "all" | CategoryId;

type CategoryOption = {
  id: CategoryFilterValue;
  label: string;
};

type CategoryFilterProps = {
  ariaLabel: string;
  moreLabel: string;
  lessLabel: string;
  categories: CategoryOption[];
  selectedCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
};

export function CategoryFilter({
  ariaLabel,
  moreLabel,
  lessLabel,
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const optionsId = useId();
  const selectedLabel = categories.find((category) => category.id === selectedCategory)?.label;
  return (
    <div className="category-picker">
      <button className="category-toggle secondary-button" type="button" aria-expanded={expanded}
        aria-controls={optionsId} onClick={() => setExpanded(!expanded)}>
        <span>{ariaLabel}: {selectedLabel}</span>
        <span className="category-toggle-hint">{expanded ? lessLabel : moreLabel}</span>
      </button>
      <div className="category-filter" id={optionsId} data-expanded={expanded} role="group" aria-label={ariaLabel}>
      {categories.map((category) => (
        <button
          className="category-button"
          data-active={selectedCategory === category.id}
          aria-pressed={selectedCategory === category.id}
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          type="button"
        >
          <CategoryIcon category={category.id} />
          <span>{category.label}</span>
        </button>
      ))}
      </div>
    </div>
  );
}
