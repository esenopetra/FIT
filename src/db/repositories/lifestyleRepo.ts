import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.lifestyle_questionnaires);

export const lifestyleRepo = {
  ...base,
  // Returns null (not undefined) when not found — see healthGoalsRepo for why.
  getByUserId: async (userId: string) =>
    (await db.lifestyle_questionnaires.where('userId').equals(userId).last()) ?? null,
};
