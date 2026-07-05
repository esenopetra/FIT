import { supabase } from './supabaseClient';
import { gatherAllData, restoreAllData, type BackupPayload } from './backup';

const BACKUPS_TABLE = 'backups';

function requireSupabase() {
  if (!supabase) throw new Error('Cloud account is not configured.');
  return supabase;
}

async function requireUserId(): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('You must be signed in to use cloud backup.');
  return user.id;
}

export async function pushBackupToCloud(): Promise<void> {
  const client = requireSupabase();
  const userId = await requireUserId();
  const payload = await gatherAllData();

  const { error } = await client
    .from(BACKUPS_TABLE)
    .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() });

  if (error) throw error;
}

export async function pullBackupFromCloud(): Promise<BackupPayload | null> {
  const client = requireSupabase();
  const userId = await requireUserId();

  const { data, error } = await client
    .from(BACKUPS_TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.data as BackupPayload) ?? null;
}

export async function restoreFromCloud(): Promise<void> {
  const payload = await pullBackupFromCloud();
  if (!payload) throw new Error('No cloud backup found.');
  await restoreAllData(payload);
}

export async function getCloudBackupMeta(): Promise<{ updatedAt: string } | null> {
  const client = requireSupabase();
  const userId = await requireUserId();

  const { data, error } = await client
    .from(BACKUPS_TABLE)
    .select('updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? { updatedAt: data.updated_at as string } : null;
}
