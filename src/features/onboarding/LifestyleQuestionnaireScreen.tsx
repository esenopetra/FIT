import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../components/layout/OnboardingLayout';
import { Field } from '../../components/forms/Field';
import { inputClass, buttonPrimaryClass } from '../../components/forms/inputStyles';
import { lifestyleFormSchema, type LifestyleFormInput, type LifestyleFormValues } from './lifestyleSchema';
import { litersToMl } from '../../lib/unitConversion';
import { generateId, nowIso } from '../../lib/id';
import { userProfileRepo, lifestyleRepo } from '../../db/repositories';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { LifestyleQuestionnaire } from '../../types';

export function LifestyleQuestionnaireScreen() {
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentUser();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LifestyleFormInput, unknown, LifestyleFormValues>({
    resolver: zodResolver(lifestyleFormSchema),
    defaultValues: {
      exerciseFrequency: 'rarely',
      activityLevel: 'sedentary',
      drinksEnoughWater: 'sometimes',
      currentWaterUnit: 'liter',
      walksDaily: 'sometimes',
      goalSpeed: 'moderate',
    },
  });

  if (isLoading) return null;
  if (!profile) {
    navigate('/onboarding/profile', { replace: true });
    return null;
  }

  async function onSubmit(values: LifestyleFormValues) {
    if (!profile) return;

    const currentWaterMlPerDay = values.currentWaterAmount
      ? values.currentWaterUnit === 'liter'
        ? litersToMl(values.currentWaterAmount)
        : values.currentWaterAmount
      : undefined;

    const timestamp = nowIso();
    const lifestyle: LifestyleQuestionnaire = {
      id: generateId(),
      userId: profile.id,
      exerciseFrequency: values.exerciseFrequency,
      activityLevel: values.activityLevel,
      drinksEnoughWater: values.drinksEnoughWater,
      currentWaterMlPerDay,
      walksDaily: values.walksDaily,
      goalSpeed: values.goalSpeed,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await lifestyleRepo.add(lifestyle);
    if (values.foodPreference) {
      await userProfileRepo.update(profile.id, { foodPreference: values.foodPreference });
    }

    navigate('/onboarding/report');
  }

  return (
    <OnboardingLayout title="A few lifestyle questions" step={2} totalSteps={3}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="How often do you exercise?" htmlFor="exerciseFrequency">
          <select id="exerciseFrequency" className={inputClass} {...register('exerciseFrequency')}>
            <option value="rarely">Rarely</option>
            <option value="one_two_days">1-2 days/week</option>
            <option value="three_four_days">3-4 days/week</option>
            <option value="five_six_days">5-6 days/week</option>
            <option value="daily">Daily</option>
          </select>
        </Field>

        <Field label="What is your activity level?" htmlFor="activityLevel">
          <select id="activityLevel" className={inputClass} {...register('activityLevel')}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderate</option>
            <option value="very_active">Very active</option>
            <option value="athlete">Athlete level</option>
          </select>
        </Field>

        <Field label="Do you drink enough water daily?" htmlFor="drinksEnoughWater">
          <select id="drinksEnoughWater" className={inputClass} {...register('drinksEnoughWater')}>
            <option value="no">No</option>
            <option value="sometimes">Sometimes</option>
            <option value="yes">Yes</option>
          </select>
        </Field>

        <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
          <Field label="How much water do you drink daily?" htmlFor="currentWaterAmount" optional>
            <input
              id="currentWaterAmount"
              type="number"
              step="0.1"
              className={inputClass}
              {...register('currentWaterAmount')}
            />
          </Field>
          <Field label="Unit" htmlFor="currentWaterUnit">
            <select id="currentWaterUnit" className={inputClass} {...register('currentWaterUnit')}>
              <option value="liter">liters</option>
              <option value="ml">ml</option>
            </select>
          </Field>
        </div>

        <Field label="Do you walk daily?" htmlFor="walksDaily">
          <select id="walksDaily" className={inputClass} {...register('walksDaily')}>
            <option value="no">No</option>
            <option value="sometimes">Sometimes</option>
            <option value="yes">Yes</option>
          </select>
        </Field>

        <Field label="Food preference" htmlFor="foodPreference" optional>
          <select id="foodPreference" className={inputClass} {...register('foodPreference')}>
            <option value="">Select…</option>
            <option value="veg">Veg</option>
            <option value="non_veg">Non-veg</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="vegan">Vegan</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>

        <Field label="Main goal speed" htmlFor="goalSpeed">
          <select id="goalSpeed" className={inputClass} {...register('goalSpeed')}>
            <option value="slow">Slow</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </Field>

        <button type="submit" className={buttonPrimaryClass} disabled={isSubmitting}>
          Continue
        </button>
      </form>
    </OnboardingLayout>
  );
}
