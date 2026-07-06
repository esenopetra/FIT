import { useNavigate } from 'react-router-dom';
import { Utensils, Droplets, Activity, BarChart3, ClipboardList, Dumbbell } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/cards/StatCard';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { RadialProgress } from '../../components/charts/RadialProgress';
import { MacroProgressChart } from '../../components/charts/MacroProgressChart';
import { TrendBarChart } from '../../components/charts/TrendBarChart';
import { cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useDailyTotals } from '../../hooks/useDailyTotals';
import { useWeeklyTrend } from '../../hooks/useWeeklyTrend';
import { useStreak } from '../../hooks/useStreak';
import { todayStr } from '../../lib/dateUtils';
import { getChartColors } from '../../components/charts/chartColors';
import { useIsDarkMode } from '../../hooks/useIsDarkMode';

const QUICK_ACTIONS = [
  { to: '/food/add', label: 'Add Food', Icon: Utensils },
  { to: '/water', label: 'Add Water', Icon: Droplets },
  { to: '/exercise/add', label: 'Add Exercise', Icon: Activity },
  { to: '/reports', label: 'View Reports', Icon: BarChart3 },
  { to: '/food/manage', label: 'Manage Foods', Icon: ClipboardList },
  { to: '/exercise/manage', label: 'Manage Exercises', Icon: Dumbbell },
];

export function DashboardScreen() {
  const navigate = useNavigate();
  const { profile, healthGoals } = useCurrentUser();
  const today = todayStr();
  const totals = useDailyTotals(profile?.id, today);
  const trend = useWeeklyTrend(profile?.id);
  const streak = useStreak(profile?.id);
  const chartColors = getChartColors(useIsDarkMode());

  if (!profile || !healthGoals || !totals) {
    return (
      <AppLayout title="Dashboard">
        <p className="text-muted">Loading your dashboard…</p>
      </AppLayout>
    );
  }

  const caloriesRemaining = totals.caloriesRemaining(healthGoals.dailyCalorieTarget);

  return (
    <AppLayout title={`Hi, ${profile.name}`}>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Calories consumed" value={`${Math.round(totals.totalCalories)}`} sub="kcal today" />
        <StatCard
          label="Calories remaining"
          value={`${Math.round(caloriesRemaining)}`}
          sub={`of ${healthGoals.dailyCalorieTarget} kcal`}
        />
        <StatCard label="Net calories" value={`${Math.round(totals.netCalories)}`} sub="consumed − burned" />
        <StatCard label="Exercise burn" value={`${Math.round(totals.totalExerciseBurn)}`} sub="kcal burned" />
        {streak !== undefined && streak > 0 && (
          <StatCard label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} sub="logging food" />
        )}
      </div>

      <section className={`${cardClass} mb-4`}>
        <h2 className="mb-3 text-sm font-semibold text-muted">Today's Progress</h2>
        <ProgressBar label="Protein" current={totals.totalProteinG} target={healthGoals.proteinTargetG} unit="g" />
        <ProgressBar label="Carbs" current={totals.totalCarbsG} target={healthGoals.carbsTargetG} unit="g" />
        <ProgressBar label="Fat" current={totals.totalFatG} target={healthGoals.fatTargetG} unit="g" />
        <ProgressBar label="Fiber" current={totals.totalFiberG} target={healthGoals.fiberTargetG} unit="g" />
        <ProgressBar label="Water" current={totals.totalWaterMl} target={healthGoals.waterTargetMl} unit="ml" />
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <section className={cardClass}>
          <h2 className="mb-2 text-center text-sm font-semibold text-muted">Calories</h2>
          <RadialProgress
            current={totals.totalCalories}
            target={healthGoals.dailyCalorieTarget}
            unit="kcal"
            color={chartColors.calories}
          />
        </section>
        <section className={cardClass}>
          <h2 className="mb-2 text-center text-sm font-semibold text-muted">Water</h2>
          <RadialProgress
            current={totals.totalWaterMl}
            target={healthGoals.waterTargetMl}
            unit="ml"
            color={chartColors.water}
          />
        </section>
      </div>

      <section className={`${cardClass} mb-4`}>
        <h2 className="mb-2 text-sm font-semibold text-muted">Macro Progress</h2>
        <MacroProgressChart
          protein={{ current: totals.totalProteinG, target: healthGoals.proteinTargetG }}
          carbs={{ current: totals.totalCarbsG, target: healthGoals.carbsTargetG }}
          fat={{ current: totals.totalFatG, target: healthGoals.fatTargetG }}
        />
      </section>

      {trend && (
        <section className={`${cardClass} mb-4`}>
          <h2 className="mb-2 text-sm font-semibold text-muted">Exercise burn (7 days)</h2>
          <TrendBarChart data={trend} dataKey="exerciseBurn" unit="kcal" color={chartColors.exercise} />
        </section>
      )}

      <section className="mb-2 grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3.5 text-xs font-medium text-ink-secondary hover:border-line hover:bg-surface-hover active:bg-track"
          >
            <action.Icon size={20} strokeWidth={1.75} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
            {action.label}
          </button>
        ))}
      </section>
    </AppLayout>
  );
}
