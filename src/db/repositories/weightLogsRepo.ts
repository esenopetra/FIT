import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.weight_logs);

export const weightLogsRepo = {
  ...base,
  byUserId: async (userId: string) => {
    const logs = await db.weight_logs.where('userId').equals(userId).toArray();
    return logs.sort((a, b) => a.logDate.localeCompare(b.logDate));
  },
  byDateRange: async (userId: string, startDate: string, endDate: string) => {
    const logs = await db.weight_logs
      .where('userId')
      .equals(userId)
      .filter((log) => log.logDate >= startDate && log.logDate <= endDate)
      .toArray();
    return logs.sort((a, b) => a.logDate.localeCompare(b.logDate));
  },
};
