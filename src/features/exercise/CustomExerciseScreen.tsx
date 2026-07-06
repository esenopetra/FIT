import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Field } from '../../components/forms/Field';
import { inputClass, buttonPrimaryClass, buttonDangerClass } from '../../components/forms/inputStyles';
import { customExerciseSchema, type CustomExerciseFormInput, type CustomExerciseFormValues } from './customExerciseSchema';
import { exerciseItemsRepo } from '../../db/repositories';
import { generateId, nowIso } from '../../lib/id';
import type { ExerciseItem } from '../../types';

export function CustomExerciseScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(!id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomExerciseFormInput, unknown, CustomExerciseFormValues>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: {
      trackingType: 'time',
      unit: 'minutes',
    },
  });

  useEffect(() => {
    if (!id) return;
    exerciseItemsRepo.getById(id).then((exercise) => {
      if (exercise) {
        reset({
          name: exercise.name,
          trackingType: exercise.trackingType,
          unit: exercise.unit,
          caloriesBurnedPerUnit: exercise.caloriesBurnedPerUnit,
          intensity: exercise.intensity,
        });
      }
      setLoaded(true);
    });
  }, [id, reset]);

  async function onSubmit(values: CustomExerciseFormValues) {
    const timestamp = nowIso();
    if (id) {
      await exerciseItemsRepo.update(id, { ...values, updatedAt: timestamp });
    } else {
      const exercise: ExerciseItem = {
        id: generateId(),
        ...values,
        isCustom: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await exerciseItemsRepo.add(exercise);
    }
    navigate(-1);
  }

  async function handleDelete() {
    if (!id) return;
    await exerciseItemsRepo.remove(id);
    navigate('/exercise/manage');
  }

  if (!loaded) {
    return (
      <AppLayout title="Custom Exercise">
        <p className="text-muted">Loading…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={id ? 'Edit Custom Exercise' : 'Add Custom Exercise'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Exercise Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" className={inputClass} {...register('name')} />
        </Field>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Field label="Tracking Type" htmlFor="trackingType">
            <select id="trackingType" className={inputClass} {...register('trackingType')}>
              <option value="time">Time</option>
              <option value="count">Count</option>
              <option value="distance">Distance</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
          <Field label="Unit" htmlFor="unit">
            <select id="unit" className={inputClass} {...register('unit')}>
              <option value="minutes">minutes</option>
              <option value="reps">reps</option>
              <option value="km">km</option>
              <option value="sets">sets</option>
              <option value="custom">custom</option>
            </select>
          </Field>
        </div>

        <Field
          label="Calories Burned per Unit"
          htmlFor="caloriesBurnedPerUnit"
          error={errors.caloriesBurnedPerUnit?.message}
        >
          <input
            id="caloriesBurnedPerUnit"
            type="number"
            step="0.01"
            className={inputClass}
            {...register('caloriesBurnedPerUnit')}
          />
        </Field>

        <Field label="Intensity" htmlFor="intensity" optional>
          <select id="intensity" className={inputClass} {...register('intensity')}>
            <option value="">Select…</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>

        <div className="space-y-3 pb-4">
          <button type="submit" className={buttonPrimaryClass} disabled={isSubmitting}>
            {id ? 'Save Changes' : 'Add Custom Exercise'}
          </button>
          {id && (
            <button type="button" className={buttonDangerClass} onClick={handleDelete}>
              Delete Exercise
            </button>
          )}
        </div>
      </form>
    </AppLayout>
  );
}
