import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
      <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-300 bg-brand-50 px-3 py-2">
        <div>
          <p className="font-medium text-slate-900">{selected.name}</p>
          <p className="text-xs text-slate-500">
            {selected.caloriesPerUnit} kcal per {selected.servingSize} {selected.unitType}
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-brand-700 underline"
          onClick={() => onSelect(null as unknown as FoodItem)}
        >
          Change
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
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => onSelect(food)}
              >
                <span>
                  {food.name}
                  {food.isCustom && <span className="ml-1 text-xs text-brand-600">(custom)</span>}
                </span>
                <span className="text-xs text-slate-400">{food.caloriesPerUnit} kcal</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && query.trim() && (
        <p className="mt-2 text-sm text-slate-500">No foods found for "{query}".</p>
      )}
    </div>
  );
}
