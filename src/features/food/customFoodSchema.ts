import { z } from 'zod';

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, 'Food name is required'),
  unitType: z.enum(['number', 'gram', 'ml', 'serving', 'cup', 'spoon']),
  servingSize: z.coerce.number().positive('Serving size must be greater than 0'),
  caloriesPerUnit: z.coerce.number().nonnegative('Calories must be 0 or greater'),
  proteinPerUnitG: z.coerce.number().nonnegative(),
  carbsPerUnitG: z.coerce.number().nonnegative(),
  fatPerUnitG: z.coerce.number().nonnegative(),
  fiberPerUnitG: z.coerce.number().nonnegative().optional().or(z.literal('').transform(() => undefined)),
  sugarPerUnitG: z.coerce.number().nonnegative().optional().or(z.literal('').transform(() => undefined)),
  sodiumPerUnitMg: z.coerce.number().nonnegative().optional().or(z.literal('').transform(() => undefined)),
  category: z.string().trim().optional(),
});

export type CustomFoodFormInput = z.input<typeof customFoodSchema>;
export type CustomFoodFormValues = z.output<typeof customFoodSchema>;
