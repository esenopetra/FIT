import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
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
        + Add Custom Exercise
      </button>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Your Custom Exercises</h2>
        {customExercises.length === 0 ? (
          <p className="text-sm text-slate-400">No custom exercises yet.</p>
        ) : (
          <ul className="space-y-2">
            {customExercises.map((exercise) => (
              <li key={exercise.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-slate-900">{exercise.name}</p>
                  <p className="text-xs text-slate-500">
                    {exercise.caloriesBurnedPerUnit} kcal per {exercise.unit}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-brand-700 underline"
                  onClick={() => navigate(`/exercise/custom/${exercise.id}`)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Predefined Exercises (read-only)</h2>
        <ul className="space-y-2">
          {predefinedExercises.map((exercise) => (
            <li key={exercise.id} className={`${cardClass} flex items-center justify-between`}>
              <p className="font-medium text-slate-900">{exercise.name}</p>
              <p className="text-xs text-slate-500">
                {exercise.caloriesBurnedPerUnit} kcal per {exercise.unit}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
