import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/cards/StatCard';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { RadialProgress } from '../../components/charts/RadialProgress';
import { MacroProgressChart } from '../../components/charts/MacroProgressChart';
import { TrendBarChart } from '../../components/charts/TrendBarChart';
import { cardClass, buttonSecondaryClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useDailyTotals } from '../../hooks/useDailyTotals';
import { useWeeklyTrend } from '../../hooks/useWeeklyTrend';
import { useStreak } from '../../hooks/useStreak';
import { todayStr } from '../../lib/dateUtils';

const QUICK_ACTIONS = [
  { to: '/food/add', label: 'Add Food', icon: '🍽️' },
  { to: '/water', label: 'Add Water', icon: '💧' },
  { to: '/exercise/add', label: 'Add Exercise', icon: '🏃' },
  { to: '/reports', label: 'View Reports', icon: '📊' },
  { to: '/food/manage', label: 'Manage Foods', icon: '📋' },
  { to: '/exercise/manage', label: 'Manage Exercises', icon: '🗂️' },
];

export function DashboardScreen() {
  const navigate = useNavigate();
  const { profile, healthGoals } = useCurrentUser();
  const today = todayStr();
  const totals = useDailyTotals(profile?.id, today);
  const trend = useWeeklyTrend(profile?.id);
  const streak = useStreak(profile?.id);

  if (!profile || !healthGoals || !totals) {
    return (
      <AppLayout title="Dashboard">
        <p className="text-slate-500">Loading your dashboard…</p>
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
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Today's Progress</h2>
        <ProgressBar label="Protein" current={totals.totalProteinG} target={healthGoals.proteinTargetG} unit="g" />
        <ProgressBar label="Carbs" current={totals.totalCarbsG} target={healthGoals.carbsTargetG} unit="g" />
        <ProgressBar label="Fat" current={totals.totalFatG} target={healthGoals.fatTargetG} unit="g" />
        <ProgressBar label="Fiber" current={totals.totalFiberG} target={healthGoals.fiberTargetG} unit="g" />
        <ProgressBar label="Water" current={totals.totalWaterMl} target={healthGoals.waterTargetMl} unit="ml" />
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <section className={cardClass}>
          <h2 className="mb-2 text-center text-sm font-semibold text-slate-500">Calories</h2>
          <RadialProgress
            current={totals.totalCalories}
            target={healthGoals.dailyCalorieTarget}
            unit="kcal"
            color="#16a34a"
          />
        </section>
        <section className={cardClass}>
          <h2 className="mb-2 text-center text-sm font-semibold text-slate-500">Water</h2>
          <RadialProgress current={totals.totalWaterMl} target={healthGoals.waterTargetMl} unit="ml" color="#0ea5e9" />
        </section>
      </div>

      <section className={`${cardClass} mb-4`}>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Macro Progress</h2>
        <MacroProgressChart
          protein={{ current: totals.totalProteinG, target: healthGoals.proteinTargetG }}
          carbs={{ current: totals.totalCarbsG, target: healthGoals.carbsTargetG }}
          fat={{ current: totals.totalFatG, target: healthGoals.fatTargetG }}
        />
      </section>

      {trend && (
        <section className={`${cardClass} mb-4`}>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Exercise burn (7 days)</h2>
          <TrendBarChart data={trend} dataKey="exerciseBurn" unit="kcal" color="#f97316" />
        </section>
      )}

      <section className="mb-4 grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-sm active:bg-slate-50"
          >
            <span className="text-xl" aria-hidden="true">
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </section>

      <button type="button" className={buttonSecondaryClass} onClick={() => navigate('/settings')}>
        Settings
      </button>
    </AppLayout>
  );
}
