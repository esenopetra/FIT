import type { FoodItem } from '../types';

export type FoodLogTotals = {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
};

// caloriesPerUnit (and other per-unit values) are defined relative to the
// food's own servingSize, so the multiplier scales by quantity / servingSize.
export function computeFoodLogTotals(foodItem: FoodItem, quantity: number): FoodLogTotals {
  const multiplier = foodItem.servingSize > 0 ? quantity / foodItem.servingSize : 0;
  const round1 = (n: number) => Math.round(n * 10) / 10;

  return {
    totalCalories: Math.round(foodItem.caloriesPerUnit * multiplier),
    totalProteinG: round1(foodItem.proteinPerUnitG * multiplier),
    totalCarbsG: round1(foodItem.carbsPerUnitG * multiplier),
    totalFatG: round1(foodItem.fatPerUnitG * multiplier),
    totalFiberG: round1((foodItem.fiberPerUnitG ?? 0) * multiplier),
  };
}
