import { z } from 'zod';

export const profileFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
    dob: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((val) => new Date(val) <= new Date(), 'Date of birth cannot be in the future'),
    heightUnit: z.enum(['cm', 'ft_in']),
    heightCm: z.coerce.number().optional(),
    heightFeet: z.coerce.number().optional(),
    heightInches: z.coerce.number().optional(),
    weightUnit: z.enum(['kg', 'lb']),
    weightValue: z.coerce.number().positive('Weight must be greater than 0'),
    goal: z.enum(['lose_weight', 'gain_weight', 'maintain_weight']),
    targetWeightValue: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.heightUnit === 'cm' && !(data.heightCm && data.heightCm > 0)) {
      ctx.addIssue({ code: 'custom', message: 'Height must be greater than 0', path: ['heightCm'] });
    }
    if (data.heightUnit === 'ft_in' && !((data.heightFeet ?? 0) > 0 || (data.heightInches ?? 0) > 0)) {
      ctx.addIssue({ code: 'custom', message: 'Height must be greater than 0', path: ['heightFeet'] });
    }
  });

// zod's coerce.number() fields have input type `unknown` — useForm's field-values
// generic must be the pre-parse Input shape, while onSubmit receives the
// parsed Output shape. See RHF's third (TTransformedValues) generic.
export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormValues = z.output<typeof profileFormSchema>;
