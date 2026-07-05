import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { inputClass, buttonPrimaryClass } from '../../components/forms/inputStyles';
import { profileFormSchema, type ProfileFormInput, type ProfileFormValues } from '../../lib/profileSchema';
import { calculateAge } from '../../lib/calculations';
import { lbToKg, kgToLb } from '../../lib/unitConversion';
import { computeHealthGoals } from '../../lib/healthGoals';
import { nowIso } from '../../lib/id';
import { userProfileRepo, lifestyleRepo, healthGoalsRepo } from '../../db/repositories';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export function EditProfileScreen() {
  const navigate = useNavigate();
  const { profile, healthGoals } = useCurrentUser();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.name,
      gender: profile.gender,
      dob: profile.dob,
      heightUnit: profile.heightUnit,
      heightCm: profile.heightUnit === 'cm' ? profile.heightValue : undefined,
      heightFeet: profile.heightUnit === 'ft_in' ? Math.floor(profile.heightValue / 12) : undefined,
      heightInches: profile.heightUnit === 'ft_in' ? Math.round(profile.heightValue % 12) : undefined,
      weightUnit: profile.weightUnit,
      weightValue: profile.weightValue,
      goal: profile.goal,
      targetWeightValue: profile.targetWeightKg
        ? profile.weightUnit === 'kg'
          ? profile.targetWeightKg
          : kgToLb(profile.targetWeightKg)
        : undefined,
    });
  }, [profile, reset]);

  const heightUnit = watch('heightUnit');
  const dob = watch('dob');
  const age = dob ? calculateAge(dob) : undefined;

  if (!profile) return null;

  async function onSubmit(values: ProfileFormValues) {
    if (!profile) return;
    const heightValue =
      values.heightUnit === 'cm'
        ? Number(values.heightCm)
        : (values.heightFeet ?? 0) * 12 + (values.heightInches ?? 0);

    const targetWeightKg = values.targetWeightValue
      ? values.weightUnit === 'kg'
        ? values.targetWeightValue
        : lbToKg(values.targetWeightValue)
      : undefined;

    const updated = await userProfileRepo.update(profile.id, {
      name: values.name,
      gender: values.gender,
      dob: values.dob,
      heightValue,
      heightUnit: values.heightUnit,
      weightValue: values.weightValue,
      weightUnit: values.weightUnit,
      goal: values.goal,
      targetWeightKg,
      updatedAt: nowIso(),
    });

    if (updated) {
      const lifestyle = await lifestyleRepo.getByUserId(updated.id);
      if (lifestyle) {
        const recomputed = computeHealthGoals(updated, lifestyle, healthGoals);
        await healthGoalsRepo.update(recomputed.id, recomputed);
      }
    }

    navigate('/settings');
  }

  return (
    <AppLayout title="Edit Profile">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" className={inputClass} {...register('name')} />
        </Field>

        <Field label="Gender" htmlFor="gender" error={errors.gender?.message}>
          <select id="gender" className={inputClass} {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>

        <Field label="Date of birth" htmlFor="dob" error={errors.dob?.message}>
          <input id="dob" type="date" className={inputClass} {...register('dob')} />
          {age !== undefined && !errors.dob && (
            <p className="mt-1 text-sm text-slate-500">Age: {age}</p>
          )}
        </Field>

        <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
          <div>
            {heightUnit === 'cm' ? (
              <Field label="Height (cm)" htmlFor="heightCm" error={errors.heightCm?.message}>
                <input id="heightCm" type="number" step="0.1" className={inputClass} {...register('heightCm')} />
              </Field>
            ) : (
              <Field label="Height (ft / in)" htmlFor="heightFeet" error={errors.heightFeet?.message}>
                <div className="flex gap-2">
                  <input
                    id="heightFeet"
                    type="number"
                    placeholder="ft"
                    className={inputClass}
                    {...register('heightFeet')}
                  />
                  <input
                    id="heightInches"
                    type="number"
                    placeholder="in"
                    className={inputClass}
                    {...register('heightInches')}
                  />
                </div>
              </Field>
            )}
          </div>
          <Field label="Unit" htmlFor="heightUnit">
            <select id="heightUnit" className={inputClass} {...register('heightUnit')}>
              <option value="cm">cm</option>
              <option value="ft_in">ft/in</option>
            </select>
          </Field>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
          <Field label="Weight" htmlFor="weightValue" error={errors.weightValue?.message}>
            <input
              id="weightValue"
              type="number"
              step="0.1"
              className={inputClass}
              {...register('weightValue')}
            />
          </Field>
          <Field label="Unit" htmlFor="weightUnit">
            <select id="weightUnit" className={inputClass} {...register('weightUnit')}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </Field>
        </div>

        <Field label="Target goal" htmlFor="goal" error={errors.goal?.message}>
          <select id="goal" className={inputClass} {...register('goal')}>
            <option value="lose_weight">Lose weight</option>
            <option value="gain_weight">Gain weight</option>
            <option value="maintain_weight">Maintain weight</option>
          </select>
        </Field>

        <Field label="Target weight" htmlFor="targetWeightValue" optional error={errors.targetWeightValue?.message}>
          <input
            id="targetWeightValue"
            type="number"
            step="0.1"
            className={inputClass}
            {...register('targetWeightValue')}
          />
        </Field>

        <button type="submit" className={buttonPrimaryClass} disabled={isSubmitting}>
          Save Changes
        </button>
      </form>
    </AppLayout>
  );
}
