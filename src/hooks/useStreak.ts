import { useLiveQuery } from 'dexie-react-hooks';
import { subDays } from 'date-fns';
import { foodLogsRepo } from '../db/repositories';
import { toDateStr, todayStr } from '../lib/dateUtils';
import type { FoodLog } from '../types';

const LOOKBACK_DAYS = 60;

export function useStreak(userId: string | undefined): number | undefined {
  const start = toDateStr(subDays(new Date(), LOOKBACK_DAYS));
  const end = todayStr();

  const logs = useLiveQuery(
    () => (userId ? foodLogsRepo.byDateRange(userId, start, end) : Promise.resolve<FoodLog[]>([])),
    [userId, start, end],
  );

  if (!logs) return undefined;

  const loggedDates = new Set(logs.map((log) => log.logDate));
  let streak = 0;
  for (let i = 0; i < LOOKBACK_DAYS; i += 1) {
    const date = toDateStr(subDays(new Date(), i));
    if (loggedDates.has(date)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
