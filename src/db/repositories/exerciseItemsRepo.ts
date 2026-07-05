import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.exercise_items);

export const exerciseItemsRepo = {
  ...base,
  search: async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return db.exercise_items.toArray();
    return db.exercise_items.filter((item) => item.name.toLowerCase().includes(q)).toArray();
  },
};
