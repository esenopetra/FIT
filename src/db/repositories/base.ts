import type { EntityTable } from 'dexie';

// EntityTable's generic key/insert-type machinery fights TypeScript when wrapped
// in a generic helper like this, so we narrow to the minimal shape we actually
// use — this keeps callers fully typed without fighting Dexie's variance rules.
type MinimalTable<T> = {
  toArray(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  add(entity: T): Promise<unknown>;
  update(id: string, patch: Partial<T>): Promise<unknown>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
};

export function createRepository<T extends { id: string }>(table: EntityTable<T, 'id'>) {
  const t = table as unknown as MinimalTable<T>;

  return {
    getAll: () => t.toArray(),
    getById: (id: string) => t.get(id),
    add: async (entity: T) => {
      await t.add(entity);
      return entity;
    },
    update: async (id: string, patch: Partial<T>) => {
      await t.update(id, patch);
      return t.get(id);
    },
    remove: (id: string) => t.delete(id),
    clear: () => t.clear(),
  };
}
