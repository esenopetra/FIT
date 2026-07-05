import { z } from 'zod';

export const customExerciseSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required'),
  trackingType: z.enum(['time', 'count', 'distance', 'custom']),
  unit: z.enum(['minutes', 'reps', 'km', 'sets', 'custom']),
  caloriesBurnedPerUnit: z.coerce.number().nonnegative('Calories must be 0 or greater'),
  intensity: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CustomExerciseFormInput = z.input<typeof customExerciseSchema>;
export type CustomExerciseFormValues = z.output<typeof customExerciseSchema>;
