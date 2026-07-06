import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { cardClass, buttonPrimaryClass } from '../../components/forms/inputStyles';
import { db } from '../../db/dexie';

export function ManageExercisesScreen() {
  const navigate = useNavigate();
  const exercises = useLiveQuery(() => db.exercise_items.toArray(), []);

  const customExercises = exercises?.filter((e) => e.isCustom) ?? [];
  const predefinedExercises = exercises?.filter((e) => !e.isCustom) ?? [];

  return (
    <AppLayout title="Manage Exercises">
      <button
        type="button"
        className={`${buttonPrimaryClass} mb-6`}
        onClick={() => navigate('/exercise/custom')}
      >
        <Plus size={16} strokeWidth={2} />
        Add Custom Exercise
      </button>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Your Custom Exercises</h2>
        {customExercises.length === 0 ? (
          <p className="text-sm text-subtle">No custom exercises yet.</p>
        ) : (
          <ul className="space-y-2">
            {customExercises.map((exercise) => (
              <li key={exercise.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-ink">{exercise.name}</p>
                  <p className="text-xs text-subtle">
                    {exercise.caloriesBurnedPerUnit} kcal per {exercise.unit}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Edit exercise"
                  className="rounded-lg p-2 text-subtle hover:bg-surface-hover hover:text-ink-secondary"
                  onClick={() => navigate(`/exercise/custom/${exercise.id}`)}
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Predefined Exercises (read-only)</h2>
        <ul className="space-y-2">
          {predefinedExercises.map((exercise) => (
            <li key={exercise.id} className={`${cardClass} flex items-center justify-between`}>
              <p className="font-medium text-ink">{exercise.name}</p>
              <p className="text-xs text-subtle">
                {exercise.caloriesBurnedPerUnit} kcal per {exercise.unit}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
