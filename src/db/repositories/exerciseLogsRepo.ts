import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.exercise_logs);

export const exerciseLogsRepo = {
  ...base,
  byDate: (userId: string, logDate: string) =>
    db.exercise_logs.where('[userId+logDate]').equals([userId, logDate]).toArray(),
  byDateRange: async (userId: string, startDate: string, endDate: string) =>
    db.exercise_logs
      .where('userId')
      .equals(userId)
      .filter((log) => log.logDate >= startDate && log.logDate <= endDate)
      .toArray(),
};
