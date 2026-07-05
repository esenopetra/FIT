import type { ExerciseLog, FoodItem, FoodLog, HealthGoals, WaterLog, WeightLog } from '../../types';

export type DailySeriesPoint = {
  date: string;
  calories: number;
  waterMl: number;
  exerciseBurn: number;
};

export type NamedCount = { name: string; count: number };
export type CategoryTotal = { category: string; calories: number };

export type ReportStats = {
  totalCalories: number;
  avgCalories: number;
  totalProteinG: number;
  avgProteinG: number;
  totalCarbsG: number;
  avgCarbsG: number;
  totalFatG: number;
  avgFatG: number;
  totalFiberG: number;
  avgFiberG: number;
  totalWaterMl: number;
  avgWaterMl: number;
  totalExerciseBurn: number;
  topFoods: NamedCount[];
  topExercises: NamedCount[];
  daysTracked: number;
  daysMissed: number;
  totalDays: number;
  goalCompletionPercent: number;
  weightSeries: { date: string; weightKg: number }[];
  weightChangeKg?: number;
  dailySeries: DailySeriesPoint[];
  categoryBreakdown: CategoryTotal[];
};

function topN(counts: Record<string, number>, n: number): NamedCount[] {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function computeReportStats(
  days: string[],
  foodLogs: FoodLog[],
  waterLogs: WaterLog[],
  exerciseLogs: ExerciseLog[],
  weightLogs: WeightLog[],
  foodItems: FoodItem[],
  healthGoals: HealthGoals | null | undefined,
  topN_: number = 5,
): ReportStats {
  const totalDays = days.length || 1;

  const totalCalories = foodLogs.reduce((s, l) => s + l.totalCalories, 0);
  const totalProteinG = foodLogs.reduce((s, l) => s + l.totalProteinG, 0);
  const totalCarbsG = foodLogs.reduce((s, l) => s + l.totalCarbsG, 0);
  const totalFatG = foodLogs.reduce((s, l) => s + l.totalFatG, 0);
  const totalFiberG = foodLogs.reduce((s, l) => s + (l.totalFiberG ?? 0), 0);
  const totalWaterMl = waterLogs.reduce((s, l) => s + l.amountMl, 0);
  const totalExerciseBurn = exerciseLogs.reduce((s, l) => s + l.caloriesBurned, 0);

  const foodNameCounts: Record<string, number> = {};
  foodLogs.forEach((l) => {
    foodNameCounts[l.foodNameSnapshot] = (foodNameCounts[l.foodNameSnapshot] ?? 0) + 1;
  });
  const exerciseNameCounts: Record<string, number> = {};
  exerciseLogs.forEach((l) => {
    exerciseNameCounts[l.exerciseNameSnapshot] = (exerciseNameCounts[l.exerciseNameSnapshot] ?? 0) + 1;
  });

  const categoryByFoodId = new Map(foodItems.map((f) => [f.id, f.category ?? 'Other']));
  const categoryTotals: Record<string, number> = {};
  foodLogs.forEach((l) => {
    const category = categoryByFoodId.get(l.foodItemId) ?? 'Other';
    categoryTotals[category] = (categoryTotals[category] ?? 0) + l.totalCalories;
  });

  const loggedDates = new Set([
    ...foodLogs.map((l) => l.logDate),
    ...waterLogs.map((l) => l.logDate),
    ...exerciseLogs.map((l) => l.logDate),
  ]);
  const daysTracked = days.filter((d) => loggedDates.has(d)).length;
  const daysMissed = totalDays - daysTracked;

  const dailySeries: DailySeriesPoint[] = days.map((date) => ({
    date,
    calories: foodLogs.filter((l) => l.logDate === date).reduce((s, l) => s + l.totalCalories, 0),
    waterMl: waterLogs.filter((l) => l.logDate === date).reduce((s, l) => s + l.amountMl, 0),
    exerciseBurn: exerciseLogs.filter((l) => l.logDate === date).reduce((s, l) => s + l.caloriesBurned, 0),
  }));

  const avgCalories = Math.round(totalCalories / totalDays);
  const goalCompletionPercent = healthGoals?.dailyCalorieTarget
    ? Math.round((avgCalories / healthGoals.dailyCalorieTarget) * 100)
    : 0;

  const sortedWeights = [...weightLogs].sort((a, b) => a.logDate.localeCompare(b.logDate));
  const weightChangeKg =
    sortedWeights.length >= 2
      ? Math.round((sortedWeights[sortedWeights.length - 1].weightKg - sortedWeights[0].weightKg) * 10) / 10
      : undefined;

  return {
    totalCalories,
    avgCalories,
    totalProteinG: Math.round(totalProteinG),
    avgProteinG: Math.round(totalProteinG / totalDays),
    totalCarbsG: Math.round(totalCarbsG),
    avgCarbsG: Math.round(totalCarbsG / totalDays),
    totalFatG: Math.round(totalFatG),
    avgFatG: Math.round(totalFatG / totalDays),
    totalFiberG: Math.round(totalFiberG),
    avgFiberG: Math.round(totalFiberG / totalDays),
    totalWaterMl,
    avgWaterMl: Math.round(totalWaterMl / totalDays),
    totalExerciseBurn,
    topFoods: topN(foodNameCounts, topN_),
    topExercises: topN(exerciseNameCounts, topN_),
    daysTracked,
    daysMissed,
    totalDays,
    goalCompletionPercent,
    weightSeries: sortedWeights.map((w) => ({ date: w.logDate, weightKg: w.weightKg })),
    weightChangeKg,
    dailySeries,
    categoryBreakdown: Object.entries(categoryTotals)
      .map(([category, calories]) => ({ category, calories }))
      .sort((a, b) => b.calories - a.calories),
  };
}

export type MonthlyTrendPoint = {
  month: string;
  label: string;
  calories: number;
  waterMl: number;
  exerciseBurn: number;
  daysTracked: number;
};

export function computeMonthlyTrend(
  year: string,
  foodLogs: FoodLog[],
  waterLogs: WaterLog[],
  exerciseLogs: ExerciseLog[],
): MonthlyTrendPoint[] {
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    return { key: `${year}-${monthNum}`, label: new Date(Number(year), i, 1).toLocaleString('default', { month: 'short' }) };
  });

  const loggedDatesByMonth = new Map<string, Set<string>>();

  return months.map(({ key, label }) => {
    const monthFood = foodLogs.filter((l) => l.logDate.startsWith(key));
    const monthWater = waterLogs.filter((l) => l.logDate.startsWith(key));
    const monthExercise = exerciseLogs.filter((l) => l.logDate.startsWith(key));

    const dates = loggedDatesByMonth.get(key) ?? new Set<string>();
    [...monthFood, ...monthWater, ...monthExercise].forEach((l) => dates.add(l.logDate));

    return {
      month: key,
      label,
      calories: monthFood.reduce((s, l) => s + l.totalCalories, 0),
      waterMl: monthWater.reduce((s, l) => s + l.amountMl, 0),
      exerciseBurn: monthExercise.reduce((s, l) => s + l.caloriesBurned, 0),
      daysTracked: dates.size,
    };
  });
}
