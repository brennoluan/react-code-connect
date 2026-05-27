import { AVAILABLE_CATEGORIES } from "../schemas/editProfileSchema";

interface CategorySelectorProps {
  value: string[];
  onChange: (categories: string[]) => void;
  disabled?: boolean;
}

export function CategorySelector({
  value = [],
  onChange,
  disabled = false,
}: CategorySelectorProps) {
  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-offwhite mb-3">
        Categorias
      </label>

      <div className="space-y-2">
        {AVAILABLE_CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={value.includes(category)}
              onChange={() => toggleCategory(category)}
              disabled={disabled}
              className="w-4 h-4 bg-dark-gray border border-gray rounded text-highlight-green focus:ring-2 focus:ring-highlight-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-offwhite group-hover:text-highlight-green transition">
              {category}
            </span>
          </label>
        ))}
      </div>

      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-4">
          {value.map((category) => (
            <span
              key={category}
              className="text-xs px-3 py-1 bg-petrol-green text-highlight-green rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
