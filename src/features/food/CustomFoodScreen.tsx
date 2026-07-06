import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { inputClass, buttonPrimaryClass, buttonDangerClass } from '../../components/forms/inputStyles';
import { customFoodSchema, type CustomFoodFormInput, type CustomFoodFormValues } from './customFoodSchema';
import { foodItemsRepo } from '../../db/repositories';
import { generateId, nowIso } from '../../lib/id';
import type { FoodItem } from '../../types';

export function CustomFoodScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(!id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomFoodFormInput, unknown, CustomFoodFormValues>({
    resolver: zodResolver(customFoodSchema),
    defaultValues: {
      unitType: 'serving',
      servingSize: 1,
    },
  });

  useEffect(() => {
    if (!id) return;
    foodItemsRepo.getById(id).then((food) => {
      if (food) {
        reset({
          name: food.name,
          unitType: food.unitType,
          servingSize: food.servingSize,
          caloriesPerUnit: food.caloriesPerUnit,
          proteinPerUnitG: food.proteinPerUnitG,
          carbsPerUnitG: food.carbsPerUnitG,
          fatPerUnitG: food.fatPerUnitG,
          fiberPerUnitG: food.fiberPerUnitG,
          sugarPerUnitG: food.sugarPerUnitG,
          sodiumPerUnitMg: food.sodiumPerUnitMg,
          category: food.category,
        });
      }
      setLoaded(true);
    });
  }, [id, reset]);

  async function onSubmit(values: CustomFoodFormValues) {
    const timestamp = nowIso();
    if (id) {
      await foodItemsRepo.update(id, { ...values, updatedAt: timestamp });
    } else {
      const food: FoodItem = {
        id: generateId(),
        ...values,
        isCustom: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await foodItemsRepo.add(food);
    }
    navigate(-1);
  }

  async function handleDelete() {
    if (!id) return;
    await foodItemsRepo.remove(id);
    navigate('/food/manage');
  }

  if (!loaded) {
    return (
      <AppLayout title="Custom Food">
        <p className="text-muted">Loading…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={id ? 'Edit Custom Food' : 'Add Custom Food'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Food Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" className={inputClass} {...register('name')} />
        </Field>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Field label="Default Unit Type" htmlFor="unitType">
            <select id="unitType" className={inputClass} {...register('unitType')}>
              <option value="number">number</option>
              <option value="gram">gram</option>
              <option value="ml">ml</option>
              <option value="serving">serving</option>
              <option value="cup">cup</option>
              <option value="spoon">spoon</option>
            </select>
          </Field>
          <Field label="Serving Size" htmlFor="servingSize" error={errors.servingSize?.message}>
            <input id="servingSize" type="number" step="0.1" className={inputClass} {...register('servingSize')} />
          </Field>
        </div>

        <Field label="Calories per Unit" htmlFor="caloriesPerUnit" error={errors.caloriesPerUnit?.message}>
          <input id="caloriesPerUnit" type="number" step="0.1" className={inputClass} {...register('caloriesPerUnit')} />
        </Field>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <Field label="Protein (g)" htmlFor="proteinPerUnitG" error={errors.proteinPerUnitG?.message}>
            <input id="proteinPerUnitG" type="number" step="0.1" className={inputClass} {...register('proteinPerUnitG')} />
          </Field>
          <Field label="Carbs (g)" htmlFor="carbsPerUnitG" error={errors.carbsPerUnitG?.message}>
            <input id="carbsPerUnitG" type="number" step="0.1" className={inputClass} {...register('carbsPerUnitG')} />
          </Field>
          <Field label="Fat (g)" htmlFor="fatPerUnitG" error={errors.fatPerUnitG?.message}>
            <input id="fatPerUnitG" type="number" step="0.1" className={inputClass} {...register('fatPerUnitG')} />
          </Field>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <Field label="Fiber (g)" htmlFor="fiberPerUnitG" optional>
            <input id="fiberPerUnitG" type="number" step="0.1" className={inputClass} {...register('fiberPerUnitG')} />
          </Field>
          <Field label="Sugar (g)" htmlFor="sugarPerUnitG" optional>
            <input id="sugarPerUnitG" type="number" step="0.1" className={inputClass} {...register('sugarPerUnitG')} />
          </Field>
          <Field label="Sodium (mg)" htmlFor="sodiumPerUnitMg" optional>
            <input id="sodiumPerUnitMg" type="number" step="0.1" className={inputClass} {...register('sodiumPerUnitMg')} />
          </Field>
        </div>

        <Field label="Food Category" htmlFor="category" optional>
          <input id="category" list="food-categories" className={inputClass} {...register('category')} />
          <datalist id="food-categories">
            <option value="Indian" />
            <option value="Fruit" />
            <option value="Homemade" />
            <option value="Drink" />
            <option value="Protein" />
            <option value="Dairy" />
            <option value="Breakfast" />
          </datalist>
        </Field>

        <div className="space-y-3 pb-4">
          <button type="submit" className={buttonPrimaryClass} disabled={isSubmitting}>
            {id ? 'Save Changes' : 'Add Custom Food'}
          </button>
          {id && (
            <button type="button" className={buttonDangerClass} onClick={handleDelete}>
              Delete Food
            </button>
          )}
        </div>
      </form>
    </AppLayout>
  );
}
