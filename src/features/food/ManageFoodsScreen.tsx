import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
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
        + Add Custom Food
      </button>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Your Custom Foods</h2>
        {customFoods.length === 0 ? (
          <p className="text-sm text-slate-400">No custom foods yet.</p>
        ) : (
          <ul className="space-y-2">
            {customFoods.map((food) => (
              <li key={food.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-slate-900">{food.name}</p>
                  <p className="text-xs text-slate-500">
                    {food.caloriesPerUnit} kcal per {food.servingSize} {food.unitType}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-brand-700 underline"
                  onClick={() => navigate(`/food/custom/${food.id}`)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Predefined Foods (read-only)</h2>
        <ul className="space-y-2">
          {predefinedFoods.map((food) => (
            <li key={food.id} className={`${cardClass} flex items-center justify-between`}>
              <p className="font-medium text-slate-900">{food.name}</p>
              <p className="text-xs text-slate-500">
                {food.caloriesPerUnit} kcal per {food.servingSize} {food.unitType}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
