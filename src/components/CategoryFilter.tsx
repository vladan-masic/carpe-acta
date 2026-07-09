type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const options = ["All", ...categories];

  return (
    <div className="category-filter" aria-label="Tip categories">
      {options.map((category) => (
        <button
          className="category-button"
          data-active={selectedCategory === category}
          key={category}
          onClick={() => onSelectCategory(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
