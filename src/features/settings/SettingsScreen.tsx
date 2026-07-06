import { useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Cloud, Scale, Ruler, ListChecks, ArrowDownUp, TriangleAlert, Info, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { ThemePreference } from '../../lib/theme';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { Disclaimer } from '../../components/layout/Disclaimer';
import {
  inputClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  buttonDangerClass,
  cardClass,
} from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../hooks/useAuth';
import { userProfileRepo, healthGoalsRepo, lifestyleRepo, weightLogsRepo, appSettingsRepo } from '../../db/repositories';
import { computeHealthGoals } from '../../lib/healthGoals';
import { toWeightKg, toHeightCm, kgToLb, cmToTotalInches } from '../../lib/unitConversion';
import { generateId, nowIso } from '../../lib/id';
import { todayStr } from '../../lib/dateUtils';
import { exportAllDataAsJson, importAllDataFromJson, clearAllData } from '../../lib/backup';
import { pushBackupToCloud, restoreFromCloud, getCloudBackupMeta } from '../../lib/cloudBackup';
import { ensureSeeded } from '../../db/seed';
import type { AppSettings, UserProfile, HealthGoals } from '../../types';

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
      <Icon size={16} strokeWidth={1.75} className="text-subtle" />
      {children}
    </h2>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { profile, healthGoals } = useCurrentUser();
  const { user, isConfigured, signOut } = useAuth();
  const { preference: themePreference, setPreference: setThemePreference } = useTheme();
  const importInputRef = useRef<HTMLInputElement>(null);

  const [weightInput, setWeightInput] = useState('');
  const [weightMessage, setWeightMessage] = useState<string | null>(null);
  const [unitMessage, setUnitMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const [isCloudBusy, setIsCloudBusy] = useState(false);

  if (!profile) return null;

  const recomputeGoals = async (updatedProfile: UserProfile, existingGoals: HealthGoals | null | undefined) => {
    const lifestyle = await lifestyleRepo.getByUserId(updatedProfile.id);
    if (!lifestyle) return;
    const recomputed = computeHealthGoals(updatedProfile, lifestyle, existingGoals);
    await healthGoalsRepo.update(recomputed.id, recomputed);
  };

  const upsertAppSettings = async (userId: string, current: UserProfile, patch: Partial<AppSettings>) => {
    const existing = await appSettingsRepo.getByUserId(userId);
    const timestamp = nowIso();
    if (existing) {
      await appSettingsRepo.update(existing.id, { ...patch, updatedAt: timestamp });
    } else {
      await appSettingsRepo.add({
        id: generateId(),
        userId,
        heightUnit: current.heightUnit,
        weightUnit: current.weightUnit,
        waterUnit: 'ml',
        createdAt: timestamp,
        updatedAt: timestamp,
        ...patch,
      });
    }
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(weightInput);
    if (!(value > 0)) {
      setWeightMessage('Enter a weight greater than 0.');
      return;
    }
    const weightKg = toWeightKg(value, profile.weightUnit);
    const timestamp = nowIso();

    await weightLogsRepo.add({
      id: generateId(),
      userId: profile.id,
      weightKg,
      logDate: todayStr(),
      createdAt: timestamp,
    });

    const updated = await userProfileRepo.update(profile.id, { weightValue: value, updatedAt: timestamp });
    if (updated) await recomputeGoals(updated, healthGoals);

    setWeightInput('');
    setWeightMessage('Weight updated.');
  };

  const handleHeightUnitChange = async (newUnit: 'cm' | 'ft_in') => {
    if (newUnit === profile.heightUnit) return;
    const heightCm = toHeightCm(profile.heightValue, profile.heightUnit);
    const newValue = newUnit === 'cm' ? heightCm : cmToTotalInches(heightCm);

    const updated = await userProfileRepo.update(profile.id, {
      heightValue: newValue,
      heightUnit: newUnit,
      updatedAt: nowIso(),
    });
    await upsertAppSettings(profile.id, profile, { heightUnit: newUnit });
    if (updated) await recomputeGoals(updated, healthGoals);
    setUnitMessage('Height unit updated.');
  };

  const handleWeightUnitChange = async (newUnit: 'kg' | 'lb') => {
    if (newUnit === profile.weightUnit) return;
    const currentKg = toWeightKg(profile.weightValue, profile.weightUnit);
    const newValue = newUnit === 'kg' ? currentKg : kgToLb(currentKg);

    const updated = await userProfileRepo.update(profile.id, {
      weightValue: newValue,
      weightUnit: newUnit,
      updatedAt: nowIso(),
    });
    await upsertAppSettings(profile.id, profile, { weightUnit: newUnit });
    if (updated) await recomputeGoals(updated, healthGoals);
    setUnitMessage('Weight unit updated.');
  };

  const handleExport = async () => {
    await exportAllDataAsJson();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importAllDataFromJson(file);
      setImportMessage('Data imported successfully.');
    } catch {
      setImportMessage('Import failed. Please check the backup file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleBackupToCloud = async () => {
    setIsCloudBusy(true);
    setCloudMessage(null);
    try {
      await pushBackupToCloud();
      setCloudMessage('Backed up to the cloud.');
    } catch (err) {
      setCloudMessage(err instanceof Error ? err.message : 'Backup failed. Please try again.');
    } finally {
      setIsCloudBusy(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    setIsCloudBusy(true);
    setCloudMessage(null);
    try {
      const meta = await getCloudBackupMeta();
      if (!meta) {
        setCloudMessage('No cloud backup found for this account yet.');
        return;
      }
      const confirmed = window.confirm(
        `Restore the backup from ${new Date(meta.updatedAt).toLocaleString()}? This will replace the data currently on this device.`,
      );
      if (!confirmed) return;
      await restoreFromCloud();
      await ensureSeeded();
      setCloudMessage('Restored from cloud backup.');
    } catch (err) {
      setCloudMessage(err instanceof Error ? err.message : 'Restore failed. Please try again.');
    } finally {
      setIsCloudBusy(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'This will permanently delete all your profile, food, water, exercise, and report data from this device. Continue?',
    );
    if (!confirmed) return;
    await clearAllData();
    await ensureSeeded();
    navigate('/onboarding/welcome', { replace: true });
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-4 pb-6">
        <section className={cardClass}>
          <SectionHeading icon={User}>Profile</SectionHeading>
          <button type="button" className={buttonSecondaryClass} onClick={() => navigate('/settings/profile')}>
            Edit Profile
          </button>
        </section>

        <section className={cardClass}>
          <SectionHeading icon={Palette}>Appearance</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const isActive = themePreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThemePreference(option.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-brand-tint-border bg-brand-tint text-brand-700 dark:text-brand-400'
                      : 'border-line text-ink-secondary hover:bg-surface-hover'
                  }`}
                >
                  <option.Icon size={18} strokeWidth={1.75} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {isConfigured && (
          <section className={cardClass}>
            <SectionHeading icon={Cloud}>Account & Cloud Backup</SectionHeading>
            {user ? (
              <>
                <p className="mb-3 text-sm text-ink-secondary">Signed in as {user.email}</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    className={buttonSecondaryClass}
                    onClick={handleBackupToCloud}
                    disabled={isCloudBusy}
                  >
                    Backup to Cloud
                  </button>
                  <button
                    type="button"
                    className={buttonSecondaryClass}
                    onClick={handleRestoreFromCloud}
                    disabled={isCloudBusy}
                  >
                    Restore from Cloud
                  </button>
                  <button type="button" className={buttonSecondaryClass} onClick={signOut}>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-secondary">
                  Sign in to back up your data and restore it if you switch devices or clear your
                  browser.
                </p>
                <button type="button" className={buttonPrimaryClass} onClick={() => navigate('/login')}>
                  Sign In / Create Account
                </button>
              </>
            )}
            {cloudMessage && <p className="mt-2 text-sm text-muted">{cloudMessage}</p>}
          </section>
        )}

        <section className={cardClass}>
          <SectionHeading icon={Scale}>Update Current Weight</SectionHeading>
          <form onSubmit={handleUpdateWeight} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              className={inputClass}
              placeholder={`Weight (${profile.weightUnit})`}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
            <button type="submit" className={`${buttonPrimaryClass} w-auto px-6`}>
              Update
            </button>
          </form>
          {weightMessage && <p className="mt-2 text-sm text-muted">{weightMessage}</p>}
          <p className="mt-2 text-xs text-subtle">
            To change your target weight, use Edit Profile above.
          </p>
        </section>

        <section className={cardClass}>
          <SectionHeading icon={Ruler}>Measurement Units</SectionHeading>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Height unit" htmlFor="heightUnitSetting">
              <select
                id="heightUnitSetting"
                className={inputClass}
                value={profile.heightUnit}
                onChange={(e) => handleHeightUnitChange(e.target.value as 'cm' | 'ft_in')}
              >
                <option value="cm">cm</option>
                <option value="ft_in">ft/in</option>
              </select>
            </Field>
            <Field label="Weight unit" htmlFor="weightUnitSetting">
              <select
                id="weightUnitSetting"
                className={inputClass}
                value={profile.weightUnit}
                onChange={(e) => handleWeightUnitChange(e.target.value as 'kg' | 'lb')}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </Field>
          </div>
          {unitMessage && <p className="text-sm text-muted">{unitMessage}</p>}
        </section>

        <section className={cardClass}>
          <SectionHeading icon={ListChecks}>Manage Lists</SectionHeading>
          <div className="space-y-2">
            <button type="button" className={buttonSecondaryClass} onClick={() => navigate('/food/manage')}>
              Manage Food List
            </button>
            <button type="button" className={buttonSecondaryClass} onClick={() => navigate('/exercise/manage')}>
              Manage Exercise List
            </button>
          </div>
        </section>

        <section className={cardClass}>
          <SectionHeading icon={ArrowDownUp}>Backup & Restore</SectionHeading>
          <div className="space-y-2">
            <button type="button" className={buttonSecondaryClass} onClick={handleExport}>
              Export All Data as JSON
            </button>
            <button
              type="button"
              className={buttonSecondaryClass}
              onClick={() => importInputRef.current?.click()}
            >
              Import Data from JSON
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {importMessage && <p className="mt-2 text-sm text-muted">{importMessage}</p>}
        </section>

        <section className={cardClass}>
          <SectionHeading icon={TriangleAlert}>Danger Zone</SectionHeading>
          <button type="button" className={buttonDangerClass} onClick={handleClearData}>
            Clear All Data
          </button>
        </section>

        <section className={cardClass}>
          <SectionHeading icon={Info}>Health Disclaimer</SectionHeading>
          <Disclaimer />
        </section>
      </div>
    </AppLayout>
  );
}
