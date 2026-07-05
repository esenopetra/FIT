import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { Disclaimer } from '../../components/layout/Disclaimer';
import { inputClass, buttonPrimaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { db } from '../../db/dexie';
import { foodLogsRepo, waterLogsRepo, exerciseLogsRepo, weightLogsRepo } from '../../db/repositories';
import { getReportRange, type ReportRangeType, todayStr } from '../../lib/dateUtils';
import { computeReportStats, computeMonthlyTrend } from './reportCalculations';
import { exportPeriodReportPdf } from '../../lib/pdfExport';
import { TrendBarChart } from '../../components/charts/TrendBarChart';
import type { FoodLog, WaterLog, ExerciseLog, WeightLog } from '../../types';

const RANGE_LABELS: Record<ReportRangeType, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  custom: 'Custom Range',
};

export function ReportsScreen() {
  const { profile, healthGoals } = useCurrentUser();
  const [rangeType, setRangeType] = useState<ReportRangeType>('week');
  const [customStart, setCustomStart] = useState(todayStr());
  const [customEnd, setCustomEnd] = useState(todayStr());
  const chartRef = useRef<HTMLDivElement>(null);

  const range = useMemo(() => {
    if (rangeType === 'custom') {
      return getReportRange('custom', new Date(), { start: customStart, end: customEnd });
    }
    return getReportRange(rangeType);
  }, [rangeType, customStart, customEnd]);

  const foodLogs = useLiveQuery(
    () => (profile ? foodLogsRepo.byDateRange(profile.id, range.start, range.end) : Promise.resolve<FoodLog[]>([])),
    [profile?.id, range.start, range.end],
  );
  const waterLogs = useLiveQuery(
    () => (profile ? waterLogsRepo.byDateRange(profile.id, range.start, range.end) : Promise.resolve<WaterLog[]>([])),
    [profile?.id, range.start, range.end],
  );
  const exerciseLogs = useLiveQuery(
    () =>
      profile ? exerciseLogsRepo.byDateRange(profile.id, range.start, range.end) : Promise.resolve<ExerciseLog[]>([]),
    [profile?.id, range.start, range.end],
  );
  const weightLogs = useLiveQuery(
    () => (profile ? weightLogsRepo.byDateRange(profile.id, range.start, range.end) : Promise.resolve<WeightLog[]>([])),
    [profile?.id, range.start, range.end],
  );
  const foodItems = useLiveQuery(() => db.food_items.toArray(), []);

  const isLoading = !profile || !foodLogs || !waterLogs || !exerciseLogs || !weightLogs || !foodItems;

  const stats = useMemo(() => {
    if (isLoading) return undefined;
    return computeReportStats(
      range.days,
      foodLogs!,
      waterLogs!,
      exerciseLogs!,
      weightLogs!,
      foodItems!,
      healthGoals,
      rangeType === 'month' ? 10 : 5,
    );
  }, [isLoading, range.days, foodLogs, waterLogs, exerciseLogs, weightLogs, foodItems, healthGoals, rangeType]);

  const monthlyTrend = useMemo(() => {
    if (isLoading || rangeType !== 'year') return undefined;
    return computeMonthlyTrend(range.start.slice(0, 4), foodLogs!, waterLogs!, exerciseLogs!);
  }, [isLoading, rangeType, range.start, foodLogs, waterLogs, exerciseLogs]);

  const bestMonth = monthlyTrend
    ? [...monthlyTrend].sort((a, b) => b.daysTracked - a.daysTracked)[0]
    : undefined;
  const lowestMonth = monthlyTrend
    ? [...monthlyTrend].sort((a, b) => a.daysTracked - b.daysTracked)[0]
    : undefined;

  async function handleExportPdf() {
    if (!profile || !stats) return;
    await exportPeriodReportPdf({
      type: rangeType,
      rangeStart: range.start,
      rangeEnd: range.end,
      profile,
      summary: stats,
      chartElement: chartRef.current,
    });
  }

  const dailyChartData = stats?.dailySeries.map((p) => ({ label: p.date.slice(5), ...p })) ?? [];
  const monthlyChartData = monthlyTrend ?? [];

  return (
    <AppLayout title="Reports">
      <Field label="Range" htmlFor="rangeType">
        <select
          id="rangeType"
          className={inputClass}
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as ReportRangeType)}
        >
          {Object.entries(RANGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      {rangeType === 'custom' && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Field label="Start" htmlFor="customStart">
            <input
              id="customStart"
              type="date"
              className={inputClass}
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </Field>
          <Field label="End" htmlFor="customEnd">
            <input
              id="customEnd"
              type="date"
              className={inputClass}
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </Field>
        </div>
      )}

      {isLoading || !stats ? (
        <p className="text-slate-500">Loading report…</p>
      ) : (
        <div className="space-y-4">
          <section className={cardClass}>
            <h2 className="mb-2 text-sm font-semibold text-slate-500">Summary</h2>
            <dl className="grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-slate-500">Total calories</dt>
              <dd className="text-right font-medium">{stats.totalCalories} kcal</dd>
              <dt className="text-slate-500">Avg calories / day</dt>
              <dd className="text-right font-medium">{stats.avgCalories} kcal</dd>
              <dt className="text-slate-500">Avg protein / day</dt>
              <dd className="text-right font-medium">{stats.avgProteinG} g</dd>
              <dt className="text-slate-500">Avg carbs / day</dt>
              <dd className="text-right font-medium">{stats.avgCarbsG} g</dd>
              <dt className="text-slate-500">Avg fat / day</dt>
              <dd className="text-right font-medium">{stats.avgFatG} g</dd>
              <dt className="text-slate-500">Avg fiber / day</dt>
              <dd className="text-right font-medium">{stats.avgFiberG} g</dd>
              <dt className="text-slate-500">Total water</dt>
              <dd className="text-right font-medium">{stats.totalWaterMl} ml</dd>
              <dt className="text-slate-500">Avg water / day</dt>
              <dd className="text-right font-medium">{stats.avgWaterMl} ml</dd>
              <dt className="text-slate-500">Exercise burn total</dt>
              <dd className="text-right font-medium">{stats.totalExerciseBurn} kcal</dd>
              <dt className="text-slate-500">Best tracking days</dt>
              <dd className="text-right font-medium">
                {stats.daysTracked} / {stats.totalDays}
              </dd>
              <dt className="text-slate-500">Missed tracking days</dt>
              <dd className="text-right font-medium">
                {stats.daysMissed} / {stats.totalDays}
              </dd>
              <dt className="text-slate-500">Goal completion</dt>
              <dd className="text-right font-medium">{stats.goalCompletionPercent}%</dd>
              {stats.weightChangeKg !== undefined && (
                <>
                  <dt className="text-slate-500">Weight change</dt>
                  <dd className="text-right font-medium">
                    {stats.weightChangeKg > 0 ? '+' : ''}
                    {stats.weightChangeKg} kg
                  </dd>
                </>
              )}
            </dl>
          </section>

          <div ref={chartRef} className="space-y-4">
            {rangeType !== 'year' && (
              <>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Daily Calories</h2>
                  <TrendBarChart data={dailyChartData} dataKey="calories" unit="kcal" color="#16a34a" />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Daily Water</h2>
                  <TrendBarChart data={dailyChartData} dataKey="waterMl" unit="ml" color="#0ea5e9" />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Daily Exercise Burn</h2>
                  <TrendBarChart data={dailyChartData} dataKey="exerciseBurn" unit="kcal" color="#f97316" />
                </section>
              </>
            )}

            {rangeType === 'year' && monthlyChartData.length > 0 && (
              <>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Month-wise Calories</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="calories" unit="kcal" color="#16a34a" />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Month-wise Water</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="waterMl" unit="ml" color="#0ea5e9" />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-500">Month-wise Exercise</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="exerciseBurn" unit="kcal" color="#f97316" />
                </section>
                {bestMonth && lowestMonth && (
                  <section className={cardClass}>
                    <h2 className="mb-2 text-sm font-semibold text-slate-500">Tracking Consistency</h2>
                    <p className="text-sm text-slate-700">
                      Best tracked month: <span className="font-medium">{bestMonth.label}</span> (
                      {bestMonth.daysTracked} days logged)
                    </p>
                    <p className="text-sm text-slate-700">
                      Lowest tracked month: <span className="font-medium">{lowestMonth.label}</span> (
                      {lowestMonth.daysTracked} days logged)
                    </p>
                  </section>
                )}
              </>
            )}

            {stats.weightSeries.length > 0 && (
              <section className={cardClass}>
                <h2 className="mb-2 text-sm font-semibold text-slate-500">Weight Progress</h2>
                <TrendBarChart
                  data={stats.weightSeries.map((w) => ({ label: w.date.slice(5), weightKg: w.weightKg }))}
                  dataKey="weightKg"
                  unit="kg"
                  color="#8b5cf6"
                />
              </section>
            )}
          </div>

          {stats.categoryBreakdown.length > 0 && (
            <section className={cardClass}>
              <h2 className="mb-2 text-sm font-semibold text-slate-500">Food Category Breakdown</h2>
              <ul className="space-y-1 text-sm">
                {stats.categoryBreakdown.map((c) => (
                  <li key={c.category} className="flex justify-between">
                    <span className="text-slate-700">{c.category}</span>
                    <span className="font-medium">{c.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={cardClass}>
            <h2 className="mb-2 text-sm font-semibold text-slate-500">Most Frequently Eaten Foods</h2>
            {stats.topFoods.length === 0 ? (
              <p className="text-sm text-slate-400">No food logged in this range.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {stats.topFoods.map((f) => (
                  <li key={f.name} className="flex justify-between">
                    <span className="text-slate-700">{f.name}</span>
                    <span className="font-medium">{f.count}x</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cardClass}>
            <h2 className="mb-2 text-sm font-semibold text-slate-500">Most Frequent Exercises</h2>
            {stats.topExercises.length === 0 ? (
              <p className="text-sm text-slate-400">No exercise logged in this range.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {stats.topExercises.map((e) => (
                  <li key={e.name} className="flex justify-between">
                    <span className="text-slate-700">{e.name}</span>
                    <span className="font-medium">{e.count}x</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cardClass}>
            <Disclaimer />
          </section>

          <button type="button" className={`${buttonPrimaryClass} mb-6`} onClick={handleExportPdf}>
            Download PDF
          </button>
        </div>
      )}
    </AppLayout>
  );
}
