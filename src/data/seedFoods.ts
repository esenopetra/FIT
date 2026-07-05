import type { FoodItem } from '../types';
import { generateId, nowIso } from '../lib/id';

// Predefined starter food list per requirements doc section 10.1.
// Nutrition values are approximate reference estimates (per stated unit) —
// the user can edit their own custom foods for exact values.
type SeedFood = Omit<FoodItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>;

const SEED_FOODS: SeedFood[] = [
  { name: 'Idly', unitType: 'number', servingSize: 1, caloriesPerUnit: 60, proteinPerUnitG: 2, carbsPerUnitG: 12, fatPerUnitG: 0.5, fiberPerUnitG: 1, category: 'Indian' },
  { name: 'Dosa', unitType: 'number', servingSize: 1, caloriesPerUnit: 133, proteinPerUnitG: 3.9, carbsPerUnitG: 18, fatPerUnitG: 5, fiberPerUnitG: 1, category: 'Indian' },
  { name: 'Appam', unitType: 'number', servingSize: 1, caloriesPerUnit: 120, proteinPerUnitG: 2, carbsPerUnitG: 22, fatPerUnitG: 2.5, fiberPerUnitG: 1, category: 'Indian' },
  { name: 'Puttu', unitType: 'serving', servingSize: 1, caloriesPerUnit: 150, proteinPerUnitG: 3, carbsPerUnitG: 32, fatPerUnitG: 1, fiberPerUnitG: 2, category: 'Indian' },
  { name: 'Kadala curry', unitType: 'serving', servingSize: 1, caloriesPerUnit: 180, proteinPerUnitG: 8, carbsPerUnitG: 22, fatPerUnitG: 7, fiberPerUnitG: 6, category: 'Indian' },
  { name: 'Rice', unitType: 'gram', servingSize: 100, caloriesPerUnit: 130, proteinPerUnitG: 2.7, carbsPerUnitG: 28, fatPerUnitG: 0.3, fiberPerUnitG: 0.4, category: 'Indian' },
  { name: 'Chapati', unitType: 'number', servingSize: 1, caloriesPerUnit: 104, proteinPerUnitG: 3, carbsPerUnitG: 18, fatPerUnitG: 2.5, fiberPerUnitG: 2, category: 'Indian' },
  { name: 'Parotta', unitType: 'number', servingSize: 1, caloriesPerUnit: 260, proteinPerUnitG: 5, carbsPerUnitG: 30, fatPerUnitG: 12, fiberPerUnitG: 1.5, category: 'Indian' },
  { name: 'Banana', unitType: 'number', servingSize: 1, caloriesPerUnit: 105, proteinPerUnitG: 1.3, carbsPerUnitG: 27, fatPerUnitG: 0.4, fiberPerUnitG: 3.1, category: 'Fruit' },
  { name: 'Apple', unitType: 'number', servingSize: 1, caloriesPerUnit: 95, proteinPerUnitG: 0.5, carbsPerUnitG: 25, fatPerUnitG: 0.3, fiberPerUnitG: 4.4, category: 'Fruit' },
  { name: 'Egg', unitType: 'number', servingSize: 1, caloriesPerUnit: 78, proteinPerUnitG: 6.3, carbsPerUnitG: 0.6, fatPerUnitG: 5.3, fiberPerUnitG: 0, category: 'Protein' },
  { name: 'Chicken curry', unitType: 'gram', servingSize: 100, caloriesPerUnit: 180, proteinPerUnitG: 18, carbsPerUnitG: 6, fatPerUnitG: 10, fiberPerUnitG: 1, category: 'Indian' },
  { name: 'Fish curry', unitType: 'gram', servingSize: 100, caloriesPerUnit: 150, proteinPerUnitG: 17, carbsPerUnitG: 5, fatPerUnitG: 7, fiberPerUnitG: 1, category: 'Indian' },
  { name: 'Milk', unitType: 'ml', servingSize: 250, caloriesPerUnit: 150, proteinPerUnitG: 8, carbsPerUnitG: 12, fatPerUnitG: 8, fiberPerUnitG: 0, category: 'Drink' },
  { name: 'Tea', unitType: 'cup', servingSize: 1, caloriesPerUnit: 40, proteinPerUnitG: 1, carbsPerUnitG: 6, fatPerUnitG: 1.5, fiberPerUnitG: 0, category: 'Drink' },
  { name: 'Coffee', unitType: 'cup', servingSize: 1, caloriesPerUnit: 45, proteinPerUnitG: 1, carbsPerUnitG: 6, fatPerUnitG: 1.8, fiberPerUnitG: 0, category: 'Drink' },
  { name: 'Oats', unitType: 'gram', servingSize: 40, caloriesPerUnit: 150, proteinPerUnitG: 5, carbsPerUnitG: 27, fatPerUnitG: 3, fiberPerUnitG: 4, category: 'Breakfast' },
  { name: 'Curd', unitType: 'gram', servingSize: 100, caloriesPerUnit: 60, proteinPerUnitG: 3.5, carbsPerUnitG: 4.7, fatPerUnitG: 3.3, fiberPerUnitG: 0, category: 'Dairy' },
  { name: 'Dal', unitType: 'gram', servingSize: 100, caloriesPerUnit: 116, proteinPerUnitG: 9, carbsPerUnitG: 20, fatPerUnitG: 0.4, fiberPerUnitG: 8, category: 'Indian' },
  { name: 'Sambar', unitType: 'gram', servingSize: 100, caloriesPerUnit: 90, proteinPerUnitG: 4, carbsPerUnitG: 12, fatPerUnitG: 3, fiberPerUnitG: 3, category: 'Indian' },
  { name: 'Coconut chutney', unitType: 'spoon', servingSize: 2, caloriesPerUnit: 90, proteinPerUnitG: 1.5, carbsPerUnitG: 3, fatPerUnitG: 8, fiberPerUnitG: 2, category: 'Indian' },
];

export function buildSeedFoodItems(): FoodItem[] {
  const timestamp = nowIso();
  return SEED_FOODS.map((food) => ({
    ...food,
    id: generateId(),
    isCustom: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}
