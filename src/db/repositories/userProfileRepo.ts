import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.user_profiles);

export const userProfileRepo = {
  ...base,
  // Returns null (not undefined) when no profile exists yet, so callers using
  // useLiveQuery can distinguish "still loading" (undefined) from "no profile".
  getCurrent: async () => (await db.user_profiles.toArray())[0] ?? null,
};
