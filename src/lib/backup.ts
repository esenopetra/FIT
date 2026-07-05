import { db } from '../db/dexie';

const TABLE_NAMES = [
  'user_profiles',
  'lifestyle_questionnaires',
  'health_goals',
  'food_items',
  'food_logs',
  'water_logs',
  'exercise_items',
  'exercise_logs',
  'weight_logs',
  'app_settings',
] as const;

export type BackupPayload = {
  exportedAt: string;
  version: 1;
  tables: Record<(typeof TABLE_NAMES)[number], unknown[]>;
};

// Reused by both the local JSON file export/import and cloud backup/restore —
// this is the one place that knows the full set of tables to snapshot.
export async function gatherAllData(): Promise<BackupPayload> {
  const tables = {} as BackupPayload['tables'];
  for (const name of TABLE_NAMES) {
    tables[name] = await db.table(name).toArray();
  }
  return { exportedAt: new Date().toISOString(), version: 1, tables };
}

export async function restoreAllData(payload: BackupPayload): Promise<void> {
  if (!payload.tables) {
    throw new Error('Invalid backup: missing tables data.');
  }

  await db.transaction('rw', TABLE_NAMES, async () => {
    for (const name of TABLE_NAMES) {
      const rows = payload.tables[name];
      if (!Array.isArray(rows)) continue;
      await db.table(name).clear();
      if (rows.length > 0) await db.table(name).bulkAdd(rows);
    }
  });
}

export async function exportAllDataAsJson(): Promise<void> {
  const payload = await gatherAllData();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `food-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importAllDataFromJson(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;
  await restoreAllData(payload);
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', TABLE_NAMES, async () => {
    for (const name of TABLE_NAMES) {
      await db.table(name).clear();
    }
  });
}
