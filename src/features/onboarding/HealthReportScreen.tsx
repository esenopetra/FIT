import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { Disclaimer } from '../../components/layout/Disclaimer';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../components/forms/inputStyles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { computeHealthGoals } from '../../lib/healthGoals';
import { healthGoalsRepo, lifestyleRepo } from '../../db/repositories';
import { calculateAge } from '../../lib/calculations';
import { exportOnboardingReportPdf } from '../../lib/pdfExport';
import type { HealthGoals } from '../../types';

export function HealthReportScreen() {
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();
  const [goals, setGoals] = useState<HealthGoals | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!profile) return;
      const lifestyle = await lifestyleRepo.getByUserId(profile.id);
      if (!lifestyle) {
        if (!cancelled) setStatus('missing');
        return;
      }

      const existing = await healthGoalsRepo.getByUserId(profile.id);
      const resolved = existing ?? computeHealthGoals(profile, lifestyle);
      if (!existing) await healthGoalsRepo.add(resolved);

      if (!cancelled) {
        setGoals(resolved);
        setStatus('ready');
      }
    }

    if (profile) run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (isLoading || status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Generating report…</div>;
  }

  if (!profile || status === 'missing') {
    navigate('/onboarding/lifestyle', { replace: true });
    return null;
  }

  if (!goals) return null;

  const age = calculateAge(profile.dob);

  return (
    <OnboardingLayout title="Your Health Report" step={3} totalSteps={3}>
      <div className="space-y-4">
        <section className={cardClass}>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Profile</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd className="text-right font-medium">{profile.name}</dd>
            <dt className="text-slate-500">Age</dt>
            <dd className="text-right font-medium">{age}</dd>
            <dt className="text-slate-500">Gender</dt>
            <dd className="text-right font-medium capitalize">{profile.gender.replace(/_/g, ' ')}</dd>
            <dt className="text-slate-500">Height</dt>
            <dd className="text-right font-medium">
              {profile.heightValue} {profile.heightUnit === 'cm' ? 'cm' : 'in'}
            </dd>
            <dt className="text-slate-500">Weight</dt>
            <dd className="text-right font-medium">
              {profile.weightValue} {profile.weightUnit}
            </dd>
          </dl>
        </section>

        <section className={cardClass}>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Body Metrics</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-slate-500">BMI</dt>
            <dd className="text-right font-medium">{goals.bmi.toFixed(1)}</dd>
            <dt className="text-slate-500">BMI category</dt>
            <dd className="text-right font-medium">{goals.bmiCategory}</dd>
            {goals.estimatedBodyFatPercentage !== undefined && (
              <>
                <dt className="text-slate-500">Estimated body fat %</dt>
                <dd className="text-right font-medium">{goals.estimatedBodyFatPercentage.toFixed(1)}%</dd>
              </>
            )}
            <dt className="text-slate-500">Recommendation</dt>
            <dd className="text-right font-medium">{goals.recommendation}</dd>
            {goals.weightToLoseKg !== undefined && (
              <>
                <dt className="text-slate-500">Weight to lose</dt>
                <dd className="text-right font-medium">{goals.weightToLoseKg.toFixed(1)} kg</dd>
              </>
            )}
            {goals.weightToGainKg !== undefined && (
              <>
                <dt className="text-slate-500">Weight to gain</dt>
                <dd className="text-right font-medium">{goals.weightToGainKg.toFixed(1)} kg</dd>
              </>
            )}
          </dl>
        </section>

        <section className={cardClass}>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Daily Targets</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-slate-500">Calories</dt>
            <dd className="text-right font-medium">{goals.dailyCalorieTarget} kcal</dd>
            <dt className="text-slate-500">Protein</dt>
            <dd className="text-right font-medium">{goals.proteinTargetG} g</dd>
            <dt className="text-slate-500">Carbohydrates</dt>
            <dd className="text-right font-medium">{goals.carbsTargetG} g</dd>
            <dt className="text-slate-500">Fat</dt>
            <dd className="text-right font-medium">{goals.fatTargetG} g</dd>
            <dt className="text-slate-500">Fiber</dt>
            <dd className="text-right font-medium">{goals.fiberTargetG} g</dd>
            <dt className="text-slate-500">Water</dt>
            <dd className="text-right font-medium">{goals.waterTargetMl} ml</dd>
          </dl>
          <p className="mt-3 text-xs text-slate-400">
            Calorie target is calculated for your goal weight, not your current weight, so it stays
            steady as you progress.
          </p>
        </section>

        <section className={cardClass}>
          <Disclaimer />
        </section>

        <div className="space-y-3 pb-4">
          <button
            type="button"
            className={buttonSecondaryClass}
            onClick={() => exportOnboardingReportPdf(profile, goals)}
          >
            Download as PDF
          </button>
          <button type="button" className={buttonPrimaryClass} onClick={() => navigate('/dashboard')}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
