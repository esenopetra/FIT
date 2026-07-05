import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { ExerciseSearchSelect } from '../../components/forms/ExerciseSearchSelect';
import { inputClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { exerciseItemsRepo, exerciseLogsRepo } from '../../db/repositories';
import { generateId, nowIso } from '../../lib/id';
import { todayStr } from '../../lib/dateUtils';
import type { ExerciseItem, ExerciseLog } from '../../types';

export function AddExerciseScreen() {
  const navigate = useNavigate();
  const { profile } = useCurrentUser();

  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [caloriesOverride, setCaloriesOverride] = useState('');
  const [manualOverride, setManualOverride] = useState(false);
  const [logDate, setLogDate] = useState(todayStr());
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayLogs = useLiveQuery(
    () => (profile ? exerciseLogsRepo.byDate(profile.id, logDate) : Promise.resolve<ExerciseLog[]>([])),
    [profile?.id, logDate],
  );

  const quantityNum = Number(quantity);
  const autoCalories =
    selectedExercise && quantityNum > 0 ? Math.round(selectedExercise.caloriesBurnedPerUnit * quantityNum) : 0;
  const finalCalories = manualOverride ? Number(caloriesOverride) || 0 : autoCalories;

  function resetForm() {
    setSelectedExercise(null);
    setQuantity('');
    setCaloriesOverride('');
    setManualOverride(false);
    setNotes('');
    setEditingId(null);
    setError(null);
  }

  async function handleEdit(log: ExerciseLog) {
    const exercise = await exerciseItemsRepo.getById(log.exerciseItemId);
    if (!exercise) return;
    setEditingId(log.id);
    setSelectedExercise(exercise);
    setQuantity(String(log.quantity));
    const expectedAuto = Math.round(exercise.caloriesBurnedPerUnit * log.quantity);
    setManualOverride(expectedAuto !== log.caloriesBurned);
    setCaloriesOverride(String(log.caloriesBurned));
    setLogDate(log.logDate);
    setNotes(log.notes ?? '');
  }

  async function handleDelete(id: string) {
    await exerciseLogsRepo.remove(id);
    if (editingId === id) resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (!selectedExercise) {
      setError('Please select an exercise.');
      return;
    }
    if (!(quantityNum > 0)) {
      setError('Quantity must be greater than 0.');
      return;
    }

    const timestamp = nowIso();
    if (editingId) {
      await exerciseLogsRepo.update(editingId, {
        exerciseItemId: selectedExercise.id,
        exerciseNameSnapshot: selectedExercise.name,
        quantity: quantityNum,
        unit: selectedExercise.unit,
        caloriesBurned: finalCalories,
        logDate,
        notes: notes || undefined,
        updatedAt: timestamp,
      });
    } else {
      const log: ExerciseLog = {
        id: generateId(),
        userId: profile.id,
        exerciseItemId: selectedExercise.id,
        exerciseNameSnapshot: selectedExercise.name,
        quantity: quantityNum,
        unit: selectedExercise.unit,
        caloriesBurned: finalCalories,
        logDate,
        notes: notes || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await exerciseLogsRepo.add(log);
    }

    resetForm();
  }

  return (
    <AppLayout title="Add Exercise">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Exercise" htmlFor="exerciseSearch">
          <ExerciseSearchSelect selected={selectedExercise} onSelect={setSelectedExercise} />
        </Field>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Field label="Quantity" htmlFor="quantity">
            <input
              id="quantity"
              type="number"
              step="0.1"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Unit" htmlFor="unit">
            <input id="unit" className={inputClass} value={selectedExercise?.unit ?? '-'} disabled />
          </Field>
        </div>

        <Field label="Calories Burned" htmlFor="caloriesBurned">
          <div className="flex items-center gap-2">
            <input
              id="caloriesBurned"
              type="number"
              className={inputClass}
              value={manualOverride ? caloriesOverride : autoCalories}
              disabled={!manualOverride}
              onChange={(e) => setCaloriesOverride(e.target.value)}
            />
            <label className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-600">
              <input
                type="checkbox"
                checked={manualOverride}
                onChange={(e) => {
                  setManualOverride(e.target.checked);
                  if (e.target.checked) setCaloriesOverride(String(autoCalories));
                }}
              />
              Manual
            </label>
          </div>
        </Field>

        <Field label="Date" htmlFor="logDate">
          <input
            id="logDate"
            type="date"
            className={inputClass}
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
          />
        </Field>

        <Field label="Notes" htmlFor="notes" optional>
          <input id="notes" className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-6 space-y-2">
          <button type="submit" className={buttonPrimaryClass}>
            {editingId ? 'Update Exercise Log' : 'Add Exercise'}
          </button>
          {editingId && (
            <button type="button" className={buttonSecondaryClass} onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Logged on {logDate}</h2>
        {!todayLogs || todayLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No exercise logged yet for this date.</p>
        ) : (
          <ul className="space-y-2">
            {todayLogs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-slate-900">{log.exerciseNameSnapshot}</p>
                  <p className="text-xs text-slate-500">
                    {log.quantity} {log.unit} · {log.caloriesBurned} kcal
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button type="button" className="text-brand-700 underline" onClick={() => handleEdit(log)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600 underline" onClick={() => handleDelete(log.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        className={`${buttonSecondaryClass} mt-6`}
        onClick={() => navigate('/exercise/custom')}
      >
        + Add Custom Exercise
      </button>
    </AppLayout>
  );
}
