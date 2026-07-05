import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { inputClass, buttonPrimaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { waterLogsRepo } from '../../db/repositories';
import { generateId, nowIso } from '../../lib/id';
import { todayStr } from '../../lib/dateUtils';
import type { WaterLog } from '../../types';

const QUICK_ADD_ML = [100, 250, 500, 1000];

export function WaterScreen() {
  const { profile, healthGoals } = useCurrentUser();
  const [logDate, setLogDate] = useState(todayStr());
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const logs = useLiveQuery(
    () => (profile ? waterLogsRepo.byDate(profile.id, logDate) : Promise.resolve<WaterLog[]>([])),
    [profile?.id, logDate],
  );

  const total = logs?.reduce((sum, log) => sum + log.amountMl, 0) ?? 0;

  async function addWater(amountMl: number) {
    if (!profile) return;
    const timestamp = nowIso();
    const log: WaterLog = {
      id: generateId(),
      userId: profile.id,
      amountMl,
      logDate,
      logTime: new Date().toTimeString().slice(0, 5),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await waterLogsRepo.add(log);
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!(amountNum > 0)) {
      setError('Amount must be greater than 0.');
      return;
    }
    setError(null);
    await addWater(amountNum);
    setAmount('');
  }

  async function handleDelete(id: string) {
    await waterLogsRepo.remove(id);
  }

  return (
    <AppLayout title="Water Tracking">
      <Field label="Date" htmlFor="logDate">
        <input
          id="logDate"
          type="date"
          className={inputClass}
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
        />
      </Field>

      {healthGoals && (
        <section className={`${cardClass} mb-4`}>
          <ProgressBar label="Today's water" current={total} target={healthGoals.waterTargetMl} unit="ml" />
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Quick Add</h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ADD_ML.map((ml) => (
            <button
              key={ml}
              type="button"
              className="rounded-lg border border-brand-300 bg-brand-50 py-3 text-sm font-semibold text-brand-700 active:bg-brand-100"
              onClick={() => addWater(ml)}
            >
              +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleManualAdd} className="mb-6">
        <Field label="Manual amount (ml)" htmlFor="amount" error={error ?? undefined}>
          <div className="flex gap-2">
            <input
              id="amount"
              type="number"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit" className={`${buttonPrimaryClass} w-auto px-6`}>
              Add
            </button>
          </div>
        </Field>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Logged on {logDate}</h2>
        {!logs || logs.length === 0 ? (
          <p className="text-sm text-slate-400">No water logged yet for this date.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="font-medium text-slate-900">{log.amountMl} ml</p>
                  {log.logTime && <p className="text-xs text-slate-500">{log.logTime}</p>}
                </div>
                <button type="button" className="text-sm text-red-600 underline" onClick={() => handleDelete(log.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppLayout>
  );
}
