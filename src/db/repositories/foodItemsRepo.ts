import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.food_items);

export const foodItemsRepo = {
  ...base,
  search: async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return db.food_items.toArray();
    return db.food_items.filter((item) => item.name.toLowerCase().includes(q)).toArray();
  },
};
