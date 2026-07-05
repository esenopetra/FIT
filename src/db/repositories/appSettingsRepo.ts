import { db } from '../dexie';
import { createRepository } from './base';

const base = createRepository(db.app_settings);

export const appSettingsRepo = {
  ...base,
  getByUserId: (userId: string) => db.app_settings.where('userId').equals(userId).first(),
};
