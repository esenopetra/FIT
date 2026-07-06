import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { Disclaimer } from '../../components/layout/Disclaimer';
import { StatList } from '../../components/cards/StatList';
import { inputClass, buttonPrimaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { db } from '../../db/dexie';
import { foodLogsRepo, waterLogsRepo, exerciseLogsRepo, weightLogsRepo } from '../../db/repositories';
import { getReportRange, type ReportRangeType, todayStr } from '../../lib/dateUtils';
import { computeReportStats, computeMonthlyTrend } from './reportCalculations';
import { exportPeriodReportPdf } from '../../lib/pdfExport';
import { TrendBarChart } from '../../components/charts/TrendBarChart';
import { getChartColors } from '../../components/charts/chartColors';
import { useIsDarkMode } from '../../hooks/useIsDarkMode';
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
  const chartColors = getChartColors(useIsDarkMode());

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
        <p className="text-muted">Loading report…</p>
      ) : (
        <div className="space-y-4">
          <section className={cardClass}>
            <h2 className="mb-1 text-sm font-semibold text-muted">Summary</h2>
            <StatList
              items={[
                { label: 'Total calories', value: `${stats.totalCalories} kcal` },
                { label: 'Avg calories / day', value: `${stats.avgCalories} kcal` },
                { label: 'Avg protein / day', value: `${stats.avgProteinG} g` },
                { label: 'Avg carbs / day', value: `${stats.avgCarbsG} g` },
                { label: 'Avg fat / day', value: `${stats.avgFatG} g` },
                { label: 'Avg fiber / day', value: `${stats.avgFiberG} g` },
                { label: 'Total water', value: `${stats.totalWaterMl} ml` },
                { label: 'Avg water / day', value: `${stats.avgWaterMl} ml` },
                { label: 'Exercise burn total', value: `${stats.totalExerciseBurn} kcal` },
                { label: 'Best tracking days', value: `${stats.daysTracked} / ${stats.totalDays}` },
                { label: 'Missed tracking days', value: `${stats.daysMissed} / ${stats.totalDays}` },
                { label: 'Goal completion', value: `${stats.goalCompletionPercent}%` },
                ...(stats.weightChangeKg !== undefined
                  ? [
                      {
                        label: 'Weight change',
                        value: `${stats.weightChangeKg > 0 ? '+' : ''}${stats.weightChangeKg} kg`,
                      },
                    ]
                  : []),
              ]}
            />
          </section>

          <div ref={chartRef} className="space-y-4">
            {rangeType !== 'year' && (
              <>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Daily Calories</h2>
                  <TrendBarChart data={dailyChartData} dataKey="calories" unit="kcal" color={chartColors.calories} />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Daily Water</h2>
                  <TrendBarChart data={dailyChartData} dataKey="waterMl" unit="ml" color={chartColors.water} />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Daily Exercise Burn</h2>
                  <TrendBarChart data={dailyChartData} dataKey="exerciseBurn" unit="kcal" color={chartColors.exercise} />
                </section>
              </>
            )}

            {rangeType === 'year' && monthlyChartData.length > 0 && (
              <>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Month-wise Calories</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="calories" unit="kcal" color={chartColors.calories} />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Month-wise Water</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="waterMl" unit="ml" color={chartColors.water} />
                </section>
                <section className={cardClass}>
                  <h2 className="mb-2 text-sm font-semibold text-muted">Month-wise Exercise</h2>
                  <TrendBarChart data={monthlyChartData} dataKey="exerciseBurn" unit="kcal" color={chartColors.exercise} />
                </section>
                {bestMonth && lowestMonth && (
                  <section className={cardClass}>
                    <h2 className="mb-2 text-sm font-semibold text-muted">Tracking Consistency</h2>
                    <p className="text-sm text-ink-secondary">
                      Best tracked month: <span className="font-medium">{bestMonth.label}</span> (
                      {bestMonth.daysTracked} days logged)
                    </p>
                    <p className="text-sm text-ink-secondary">
                      Lowest tracked month: <span className="font-medium">{lowestMonth.label}</span> (
                      {lowestMonth.daysTracked} days logged)
                    </p>
                  </section>
                )}
              </>
            )}

            {stats.weightSeries.length > 0 && (
              <section className={cardClass}>
                <h2 className="mb-2 text-sm font-semibold text-muted">Weight Progress</h2>
                <TrendBarChart
                  data={stats.weightSeries.map((w) => ({ label: w.date.slice(5), weightKg: w.weightKg }))}
                  dataKey="weightKg"
                  unit="kg"
                  color={chartColors.weight}
                />
              </section>
            )}
          </div>

          {stats.categoryBreakdown.length > 0 && (
            <section className={cardClass}>
              <h2 className="mb-1 text-sm font-semibold text-muted">Food Category Breakdown</h2>
              <StatList items={stats.categoryBreakdown.map((c) => ({ label: c.category, value: `${c.calories} kcal` }))} />
            </section>
          )}

          <section className={cardClass}>
            <h2 className="mb-1 text-sm font-semibold text-muted">Most Frequently Eaten Foods</h2>
            {stats.topFoods.length === 0 ? (
              <p className="text-sm text-subtle">No food logged in this range.</p>
            ) : (
              <StatList items={stats.topFoods.map((f) => ({ label: f.name, value: `${f.count}×` }))} />
            )}
          </section>

          <section className={cardClass}>
            <h2 className="mb-1 text-sm font-semibold text-muted">Most Frequent Exercises</h2>
            {stats.topExercises.length === 0 ? (
              <p className="text-sm text-subtle">No exercise logged in this range.</p>
            ) : (
              <StatList items={stats.topExercises.map((e) => ({ label: e.name, value: `${e.count}×` }))} />
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
