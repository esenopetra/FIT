import { z } from 'zod';

export const lifestyleFormSchema = z.object({
  exerciseFrequency: z.enum(['rarely', 'one_two_days', 'three_four_days', 'five_six_days', 'daily']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active', 'athlete']),
  drinksEnoughWater: z.enum(['no', 'sometimes', 'yes']),
  currentWaterAmount: z.coerce.number().nonnegative().optional().or(z.literal('').transform(() => undefined)),
  currentWaterUnit: z.enum(['ml', 'liter']),
  walksDaily: z.enum(['no', 'sometimes', 'yes']),
  foodPreference: z
    .enum(['veg', 'non_veg', 'eggetarian', 'vegan', 'mixed'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
  goalSpeed: z.enum(['slow', 'moderate', 'aggressive']),
});

export type LifestyleFormInput = z.input<typeof lifestyleFormSchema>;
export type LifestyleFormValues = z.output<typeof lifestyleFormSchema>;
