import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { FoodSearchSelect } from '../../components/forms/FoodSearchSelect';
import { inputClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { foodItemsRepo, foodLogsRepo } from '../../db/repositories';
import { computeFoodLogTotals } from '../../lib/foodCalculation';
import { generateId, nowIso } from '../../lib/id';
import { todayStr } from '../../lib/dateUtils';
import type { FoodItem, FoodLog, MealCategory } from '../../types';

const MEAL_CATEGORIES: { value: MealCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export function AddFoodScreen() {
  const navigate = useNavigate();
  const { profile } = useCurrentUser();

  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [logDate, setLogDate] = useState(todayStr());
  const [logTime, setLogTime] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayLogs = useLiveQuery(
    () => (profile ? foodLogsRepo.byDate(profile.id, logDate) : Promise.resolve<FoodLog[]>([])),
    [profile?.id, logDate],
  );

  const quantityNum = Number(quantity);
  const preview =
    selectedFood && quantityNum > 0 ? computeFoodLogTotals(selectedFood, quantityNum) : null;

  function resetForm() {
    setSelectedFood(null);
    setQuantity('');
    setLogTime('');
    setNotes('');
    setEditingId(null);
    setError(null);
  }

  async function handleEdit(log: FoodLog) {
    const food = await foodItemsRepo.getById(log.foodItemId);
    if (!food) return;
    setEditingId(log.id);
    setSelectedFood(food);
    setQuantity(String(log.quantity));
    setMealCategory(log.mealCategory);
    setLogDate(log.logDate);
    setLogTime(log.logTime ?? '');
    setNotes(log.notes ?? '');
  }

  async function handleDelete(id: string) {
    await foodLogsRepo.remove(id);
    if (editingId === id) resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (!selectedFood) {
      setError('Please select a food item.');
      return;
    }
    if (!(quantityNum > 0)) {
      setError('Quantity must be greater than 0.');
      return;
    }

    const totals = computeFoodLogTotals(selectedFood, quantityNum);
    const timestamp = nowIso();

    if (editingId) {
      await foodLogsRepo.update(editingId, {
        foodItemId: selectedFood.id,
        foodNameSnapshot: selectedFood.name,
        mealCategory,
        quantity: quantityNum,
        unitType: selectedFood.unitType,
        ...totals,
        logDate,
        logTime: logTime || undefined,
        notes: notes || undefined,
        updatedAt: timestamp,
      });
    } else {
      const log: FoodLog = {
        id: generateId(),
        userId: profile.id,
        foodItemId: selectedFood.id,
        foodNameSnapshot: selectedFood.name,
        mealCategory,
        quantity: quantityNum,
        unitType: selectedFood.unitType,
        ...totals,
        logDate,
        logTime: logTime || undefined,
        notes: notes || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await foodLogsRepo.add(log);
    }

    resetForm();
  }

  return (
    <AppLayout title="Add Food">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Meal Category" htmlFor="mealCategory">
          <select
            id="mealCategory"
            className={inputClass}
            value={mealCategory}
            onChange={(e) => setMealCategory(e.target.value as MealCategory)}
          >
            {MEAL_CATEGORIES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Food Item" htmlFor="foodSearch">
          <FoodSearchSelect selected={selectedFood} onSelect={setSelectedFood} />
        </Field>

        <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
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
            <input id="unit" className={inputClass} value={selectedFood?.unitType ?? '-'} disabled />
          </Field>
        </div>

        {preview && (
          <p className="mb-4 text-sm text-slate-600">
            {preview.totalCalories} kcal · P {preview.totalProteinG}g · C {preview.totalCarbsG}g · F{' '}
            {preview.totalFatG}g · Fiber {preview.totalFiberG}g
          </p>
        )}

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Field label="Date" htmlFor="logDate">
            <input
              id="logDate"
              type="date"
              className={inputClass}
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </Field>
          <Field label="Time" htmlFor="logTime" optional>
            <input
              id="logTime"
              type="time"
              className={inputClass}
              value={logTime}
              onChange={(e) => setLogTime(e.target.value)}
            />
          </Field>
        </div>

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
            {editingId ? 'Update Food Log' : 'Add Food'}
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
          <p className="text-sm text-slate-400">No food logged yet for this date.</p>
        ) : (
          <ul className="space-y-2">
            {todayLogs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-slate-900">{log.foodNameSnapshot}</p>
                  <p className="text-xs text-slate-500">
                    {log.mealCategory} · {log.quantity} {log.unitType} · {log.totalCalories} kcal
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
        onClick={() => navigate('/food/custom')}
      >
        + Add Custom Food
      </button>
    </AppLayout>
  );
}
