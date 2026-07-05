import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
      <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-300 bg-brand-50 px-3 py-2">
        <div>
          <p className="font-medium text-slate-900">{selected.name}</p>
          <p className="text-xs text-slate-500">
            {selected.caloriesBurnedPerUnit} kcal per {selected.unit}
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-brand-700 underline"
          onClick={() => onSelect(null as unknown as ExerciseItem)}
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
        placeholder="Search exercise (e.g. walking, push-ups)"
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search exercise"
      />
      {results && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => onSelect(exercise)}
              >
                <span>
                  {exercise.name}
                  {exercise.isCustom && <span className="ml-1 text-xs text-brand-600">(custom)</span>}
                </span>
                <span className="text-xs text-slate-400">{exercise.caloriesBurnedPerUnit} kcal/{exercise.unit}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && query.trim() && (
        <p className="mt-2 text-sm text-slate-500">No exercises found for "{query}".</p>
      )}
    </div>
  );
}
