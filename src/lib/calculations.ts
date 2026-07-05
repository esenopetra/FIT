import type { ActivityLevel, Gender, Goal, GoalSpeed } from '../types';

// All formulas below follow requirements doc section 9 exactly.

export function calculateAge(dob: string, asOf: Date = new Date()): number {
  const birth = new Date(dob);
  let age = asOf.getFullYear() - birth.getFullYear();
  const monthDiff = asOf.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

// 9.1 BMI
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy weight';
  if (bmi < 30) return 'Overweight';
  return 'Obesity';
}

// 9.2 Estimated body fat % — hidden (undefined) for genders with no defined
// GenderValue rather than guessing, since fabricating a number in a health
// context would be misleading.
export function calculateEstimatedBodyFat(
  bmi: number,
  age: number,
  gender: Gender,
): number | undefined {
  if (gender !== 'male' && gender !== 'female') return undefined;
  const genderValue = gender === 'male' ? 1 : 0;
  const bodyFat = 1.2 * bmi + 0.23 * age - 10.8 * genderValue - 5.4;
  return Math.round(bodyFat * 10) / 10;
}

// 9.3 BMR — Mifflin-St Jeor
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  if (gender === 'male') return Math.round(male);
  if (gender === 'female') return Math.round(female);
  return Math.round((male + female) / 2);
}

// 9.4 Activity multiplier
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// 9.5 Daily calorie target
const GOAL_SPEED_ADJUSTMENT: Record<GoalSpeed, number> = {
  slow: 250,
  moderate: 400,
  aggressive: 500,
};

// Minimum safe calorie guardrails — configurable app-level constants so
// the app never recommends an extremely low calorie target.
export const MIN_SAFE_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
  other: 1350,
  prefer_not_to_say: 1350,
};

export function calculateDailyCalorieTarget(
  tdee: number,
  goal: Goal,
  goalSpeed: GoalSpeed,
  gender: Gender,
): number {
  const adjustment = GOAL_SPEED_ADJUSTMENT[goalSpeed];
  let target = tdee;
  if (goal === 'lose_weight') target = tdee - adjustment;
  if (goal === 'gain_weight') target = tdee + adjustment;
  return Math.max(target, MIN_SAFE_CALORIES[gender]);
}

// 9.6 Weight to lose or gain
export type WeightRecommendation = {
  recommendation: string;
  weightToLoseKg?: number;
  weightToGainKg?: number;
  // The weight to base BMR/TDEE/calorie-target on: the user's explicit target
  // weight if set, otherwise the nearest healthy-BMI-range boundary (or
  // current weight, if already within the healthy range).
  effectiveTargetWeightKg: number;
};

export function calculateWeightRecommendation(
  currentWeightKg: number,
  heightCm: number,
  targetWeightKg?: number,
): WeightRecommendation {
  if (targetWeightKg && targetWeightKg > 0) {
    const diff = Math.round((currentWeightKg - targetWeightKg) * 10) / 10;
    if (diff > 0) return { recommendation: 'Lose weight', weightToLoseKg: diff, effectiveTargetWeightKg: targetWeightKg };
    if (diff < 0) return { recommendation: 'Gain weight', weightToGainKg: Math.abs(diff), effectiveTargetWeightKg: targetWeightKg };
    return { recommendation: 'Maintain weight', effectiveTargetWeightKg: targetWeightKg };
  }

  const heightM = heightCm / 100;
  const healthyLower = 18.5 * heightM * heightM;
  const healthyUpper = 24.9 * heightM * heightM;

  if (currentWeightKg > healthyUpper) {
    return {
      recommendation: 'Lose weight',
      weightToLoseKg: Math.round((currentWeightKg - healthyUpper) * 10) / 10,
      effectiveTargetWeightKg: healthyUpper,
    };
  }
  if (currentWeightKg < healthyLower) {
    return {
      recommendation: 'Gain weight',
      weightToGainKg: Math.round((healthyLower - currentWeightKg) * 10) / 10,
      effectiveTargetWeightKg: healthyLower,
    };
  }
  return { recommendation: 'Maintain weight', effectiveTargetWeightKg: currentWeightKg };
}

// 9.7 Macro goals
const PROTEIN_FACTOR: Record<Goal, number> = {
  lose_weight: 1.6,
  maintain_weight: 1.2,
  gain_weight: 1.6,
};

const FIBER_DEFAULT: Record<Gender, number> = {
  female: 25,
  male: 38,
  other: 30,
  prefer_not_to_say: 30,
};

export type MacroTargets = {
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
};

export function calculateMacroTargets(
  weightKg: number,
  dailyCalorieTarget: number,
  goal: Goal,
  gender: Gender,
): MacroTargets {
  const proteinTargetG = Math.round(weightKg * PROTEIN_FACTOR[goal]);
  const proteinCalories = proteinTargetG * 4;

  const fatCalories = dailyCalorieTarget * 0.25;
  const fatTargetG = Math.round(fatCalories / 9);

  const carbCalories = Math.max(dailyCalorieTarget - proteinCalories - fatCalories, 0);
  const carbsTargetG = Math.round(carbCalories / 4);

  const fiberTargetG = FIBER_DEFAULT[gender];

  return { proteinTargetG, carbsTargetG, fatTargetG, fiberTargetG };
}

// 9.8 Water goal
export function calculateWaterTargetMl(weightKg: number): number {
  return Math.round(weightKg * 35);
}

// 9.9 Net calories
export function calculateNetCalories(caloriesConsumed: number, exerciseCaloriesBurned: number): number {
  return caloriesConsumed - exerciseCaloriesBurned;
}

export function calculateCaloriesRemaining(dailyCalorieTarget: number, netCalories: number): number {
  return dailyCalorieTarget - netCalories;
}

// Section 14 — progress percentage, capped visually at 100% by the caller
// while the actual value is preserved for display (e.g. "115%").
export function calculateProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((current / target) * 100);
}
