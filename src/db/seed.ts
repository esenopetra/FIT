import { db } from './dexie';
import { buildSeedFoodItems } from '../data/seedFoods';
import { buildSeedExerciseItems } from '../data/seedExercises';

export async function ensureSeeded(): Promise<void> {
  const [foodCount, exerciseCount] = await Promise.all([
    db.food_items.count(),
    db.exercise_items.count(),
  ]);

  if (foodCount === 0) {
    await db.food_items.bulkAdd(buildSeedFoodItems());
  }
  if (exerciseCount === 0) {
    await db.exercise_items.bulkAdd(buildSeedExerciseItems());
  }
}
