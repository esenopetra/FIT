import { useLiveQuery } from 'dexie-react-hooks';
import { subDays, format } from 'date-fns';
import { foodLogsRepo, waterLogsRepo, exerciseLogsRepo } from '../db/repositories';
import { toDateStr, todayStr } from '../lib/dateUtils';
import type { FoodLog, WaterLog, ExerciseLog } from '../types';

export type DayTrendPoint = {
  date: string;
  label: string;
  calories: number;
  waterMl: number;
  exerciseBurn: number;
};

export function useWeeklyTrend(userId: string | undefined): DayTrendPoint[] | undefined {
  const today = todayStr();
  const start = toDateStr(subDays(new Date(), 6));

  const foodLogs = useLiveQuery(
    () => (userId ? foodLogsRepo.byDateRange(userId, start, today) : Promise.resolve<FoodLog[]>([])),
    [userId, start, today],
  );
  const waterLogs = useLiveQuery(
    () => (userId ? waterLogsRepo.byDateRange(userId, start, today) : Promise.resolve<WaterLog[]>([])),
    [userId, start, today],
  );
  const exerciseLogs = useLiveQuery(
    () => (userId ? exerciseLogsRepo.byDateRange(userId, start, today) : Promise.resolve<ExerciseLog[]>([])),
    [userId, start, today],
  );

  if (!userId || !foodLogs || !waterLogs || !exerciseLogs) return undefined;

  const days: DayTrendPoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = toDateStr(subDays(new Date(), i));
    const label = format(subDays(new Date(), i), 'EEE');
    const calories = foodLogs.filter((l) => l.logDate === date).reduce((s, l) => s + l.totalCalories, 0);
    const waterMl = waterLogs.filter((l) => l.logDate === date).reduce((s, l) => s + l.amountMl, 0);
    const exerciseBurn = exerciseLogs
      .filter((l) => l.logDate === date)
      .reduce((s, l) => s + l.caloriesBurned, 0);
    days.push({ date, label, calories, waterMl, exerciseBurn });
  }
  return days;
}
