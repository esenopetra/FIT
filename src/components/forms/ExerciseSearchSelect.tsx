import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { exerciseItemsRepo } from '../../db/repositories';
import { inputClass } from './inputStyles';
import type { ExerciseItem } from '../../types';

export function ExerciseSearchSelect({
  selected,
  onSelect,
}: {
  selected: ExerciseItem | null;
  onSelect: (exercise: ExerciseItem) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useLiveQuery(() => exerciseItemsRepo.search(query), [query]);

  if (selected) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-tint-border bg-brand-tint px-3.5 py-2.5">
        <div>
          <p className="font-medium text-ink">{selected.name}</p>
          <p className="text-xs text-muted">
            {selected.caloriesBurnedPerUnit} kcal per {selected.unit}
          </p>
        </div>
        <button
          type="button"
          aria-label="Change exercise"
          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-tint-border dark:text-brand-400"
          onClick={() => onSelect(null as unknown as ExerciseItem)}
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
        placeholder="Search exercise (e.g. walking, push-ups)"
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search exercise"
      />
      {results && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between border-b border-line-subtle px-3.5 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-hover"
                onClick={() => onSelect(exercise)}
              >
                <span>
                  {exercise.name}
                  {exercise.isCustom && <span className="ml-1 text-xs text-brand-600 dark:text-brand-400">(custom)</span>}
                </span>
                <span className="text-xs text-subtle">
                  {exercise.caloriesBurnedPerUnit} kcal/{exercise.unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && query.trim() && (
        <p className="mt-2 text-sm text-subtle">No exercises found for "{query}".</p>
      )}
    </div>
  );
}
