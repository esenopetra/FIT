import { useLiveQuery } from 'dexie-react-hooks';
import { foodLogsRepo, waterLogsRepo, exerciseLogsRepo } from '../db/repositories';
import { calculateCaloriesRemaining, calculateNetCalories } from '../lib/calculations';
import type { FoodLog, WaterLog, ExerciseLog } from '../types';

export type DailyTotals = {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalWaterMl: number;
  totalExerciseBurn: number;
  netCalories: number;
  caloriesRemaining: (target: number) => number;
};

// Aggregation per requirements doc section 14, for a given date.
export function useDailyTotals(userId: string | undefined, logDate: string): DailyTotals | undefined {
  const foodLogs = useLiveQuery(
    () => (userId ? foodLogsRepo.byDate(userId, logDate) : Promise.resolve<FoodLog[]>([])),
    [userId, logDate],
  );
  const waterLogs = useLiveQuery(
    () => (userId ? waterLogsRepo.byDate(userId, logDate) : Promise.resolve<WaterLog[]>([])),
    [userId, logDate],
  );
  const exerciseLogs = useLiveQuery(
    () => (userId ? exerciseLogsRepo.byDate(userId, logDate) : Promise.resolve<ExerciseLog[]>([])),
    [userId, logDate],
  );

  if (!userId || !foodLogs || !waterLogs || !exerciseLogs) return undefined;

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.totalCalories, 0);
  const totalProteinG = foodLogs.reduce((sum, log) => sum + log.totalProteinG, 0);
  const totalCarbsG = foodLogs.reduce((sum, log) => sum + log.totalCarbsG, 0);
  const totalFatG = foodLogs.reduce((sum, log) => sum + log.totalFatG, 0);
  const totalFiberG = foodLogs.reduce((sum, log) => sum + (log.totalFiberG ?? 0), 0);
  const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);
  const totalExerciseBurn = exerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const netCalories = calculateNetCalories(totalCalories, totalExerciseBurn);

  return {
    totalCalories,
    totalProteinG,
    totalCarbsG,
    totalFatG,
    totalFiberG,
    totalWaterMl,
    totalExerciseBurn,
    netCalories,
    caloriesRemaining: (target: number) => calculateCaloriesRemaining(target, netCalories),
  };
}
