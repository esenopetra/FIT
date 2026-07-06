import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { cardClass, buttonPrimaryClass } from '../../components/forms/inputStyles';
import { db } from '../../db/dexie';

export function ManageFoodsScreen() {
  const navigate = useNavigate();
  const foods = useLiveQuery(() => db.food_items.toArray(), []);

  const customFoods = foods?.filter((f) => f.isCustom) ?? [];
  const predefinedFoods = foods?.filter((f) => !f.isCustom) ?? [];

  return (
    <AppLayout title="Manage Foods">
      <button type="button" className={`${buttonPrimaryClass} mb-6`} onClick={() => navigate('/food/custom')}>
        <Plus size={16} strokeWidth={2} />
        Add Custom Food
      </button>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Your Custom Foods</h2>
        {customFoods.length === 0 ? (
          <p className="text-sm text-subtle">No custom foods yet.</p>
        ) : (
          <ul className="space-y-2">
            {customFoods.map((food) => (
              <li key={food.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-ink">{food.name}</p>
                  <p className="text-xs text-subtle">
                    {food.caloriesPerUnit} kcal per {food.servingSize} {food.unitType}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Edit food"
                  className="rounded-lg p-2 text-subtle hover:bg-surface-hover hover:text-ink-secondary"
                  onClick={() => navigate(`/food/custom/${food.id}`)}
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Predefined Foods (read-only)</h2>
        <ul className="space-y-2">
          {predefinedFoods.map((food) => (
            <li key={food.id} className={`${cardClass} flex items-center justify-between`}>
              <p className="font-medium text-ink">{food.name}</p>
              <p className="text-xs text-subtle">
                {food.caloriesPerUnit} kcal per {food.servingSize} {food.unitType}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
