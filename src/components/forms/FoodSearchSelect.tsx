import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { foodItemsRepo } from '../../db/repositories';
import { inputClass } from './inputStyles';
import type { FoodItem } from '../../types';

export function FoodSearchSelect({
  selected,
  onSelect,
}: {
  selected: FoodItem | null;
  onSelect: (food: FoodItem) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useLiveQuery(() => foodItemsRepo.search(query), [query]);

  if (selected) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-tint-border bg-brand-tint px-3.5 py-2.5">
        <div>
          <p className="font-medium text-ink">{selected.name}</p>
          <p className="text-xs text-muted">
            {selected.caloriesPerUnit} kcal per {selected.servingSize} {selected.unitType}
          </p>
        </div>
        <button
          type="button"
          aria-label="Change food"
          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-tint-border dark:text-brand-400"
          onClick={() => onSelect(null as unknown as FoodItem)}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search food (e.g. idly, rice, banana)"
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search food"
      />
      {results && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between border-b border-line-subtle px-3.5 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-hover"
                onClick={() => onSelect(food)}
              >
                <span>
                  {food.name}
                  {food.isCustom && <span className="ml-1 text-xs text-brand-600 dark:text-brand-400">(custom)</span>}
                </span>
                <span className="text-xs text-subtle">{food.caloriesPerUnit} kcal</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && query.trim() && (
        <p className="mt-2 text-sm text-subtle">No foods found for "{query}".</p>
      )}
    </div>
  );
}
