import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.health_goals);

export const healthGoalsRepo = {
  ...base,
  // Returns null (not undefined) when not found, so useLiveQuery consumers can
  // distinguish "still loading" (undefined) from "resolved: no goals yet".
  getByUserId: async (userId: string) => (await db.health_goals.where('userId').equals(userId).last()) ?? null,
};
