import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { Disclaimer } from '../../components/layout/Disclaimer';
import { StatList } from '../../components/cards/StatList';
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
    return <div className="flex min-h-screen items-center justify-center text-muted">Generating report…</div>;
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
          <h2 className="mb-1 text-sm font-semibold text-muted">Profile</h2>
          <StatList
            items={[
              { label: 'Name', value: profile.name },
              { label: 'Age', value: age },
              { label: 'Gender', value: <span className="capitalize">{profile.gender.replace(/_/g, ' ')}</span> },
              { label: 'Height', value: `${profile.heightValue} ${profile.heightUnit === 'cm' ? 'cm' : 'in'}` },
              { label: 'Weight', value: `${profile.weightValue} ${profile.weightUnit}` },
            ]}
          />
        </section>

        <section className={cardClass}>
          <h2 className="mb-1 text-sm font-semibold text-muted">Body Metrics</h2>
          <StatList
            items={[
              { label: 'BMI', value: goals.bmi.toFixed(1) },
              { label: 'BMI category', value: goals.bmiCategory },
              ...(goals.estimatedBodyFatPercentage !== undefined
                ? [{ label: 'Estimated body fat %', value: `${goals.estimatedBodyFatPercentage.toFixed(1)}%` }]
                : []),
              { label: 'Recommendation', value: goals.recommendation },
              ...(goals.weightToLoseKg !== undefined
                ? [{ label: 'Weight to lose', value: `${goals.weightToLoseKg.toFixed(1)} kg` }]
                : []),
              ...(goals.weightToGainKg !== undefined
                ? [{ label: 'Weight to gain', value: `${goals.weightToGainKg.toFixed(1)} kg` }]
                : []),
            ]}
          />
        </section>

        <section className={cardClass}>
          <h2 className="mb-1 text-sm font-semibold text-muted">Daily Targets</h2>
          <StatList
            items={[
              { label: 'Calories', value: `${goals.dailyCalorieTarget} kcal` },
              { label: 'Protein', value: `${goals.proteinTargetG} g` },
              { label: 'Carbohydrates', value: `${goals.carbsTargetG} g` },
              { label: 'Fat', value: `${goals.fatTargetG} g` },
              { label: 'Fiber', value: `${goals.fiberTargetG} g` },
              { label: 'Water', value: `${goals.waterTargetMl} ml` },
            ]}
          />
          <p className="mt-3 text-xs text-subtle">
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
