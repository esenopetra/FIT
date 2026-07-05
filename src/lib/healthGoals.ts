import type { HealthGoals, LifestyleQuestionnaire, UserProfile } from '../types';
import {
  calculateAge,
  calculateBMI,
  calculateBMR,
  calculateDailyCalorieTarget,
  calculateEstimatedBodyFat,
  calculateMacroTargets,
  calculateTDEE,
  calculateWaterTargetMl,
  calculateWeightRecommendation,
  getBMICategory,
} from './calculations';
import { toHeightCm, toWeightKg } from './unitConversion';
import { generateId, nowIso } from './id';

// Reused both when generating the initial onboarding report and whenever a
// profile/weight edit needs to recompute goals. Pass `existing` to preserve
// the record's id and createdAt when updating rather than creating a new row.
export function computeHealthGoals(
  profile: UserProfile,
  lifestyle: LifestyleQuestionnaire,
  existing?: HealthGoals | null,
): HealthGoals {
  const heightCm = toHeightCm(profile.heightValue, profile.heightUnit);
  const weightKg = toWeightKg(profile.weightValue, profile.weightUnit);
  const age = calculateAge(profile.dob);

  // BMI and body fat % describe current body composition, so they always use
  // current weight. BMR/TDEE/calorie target use the effective target weight
  // instead, so the target reflects what the user's body will need once they
  // reach their goal weight — a steadier number that isn't inflated by the
  // (often much higher) metabolic rate of the current, heavier body.
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const estimatedBodyFatPercentage = calculateEstimatedBodyFat(bmi, age, profile.gender);

  const { recommendation, weightToLoseKg, weightToGainKg, effectiveTargetWeightKg } =
    calculateWeightRecommendation(weightKg, heightCm, profile.targetWeightKg);

  const bmr = calculateBMR(effectiveTargetWeightKg, heightCm, age, profile.gender);
  const tdee = calculateTDEE(bmr, lifestyle.activityLevel);
  const dailyCalorieTarget = calculateDailyCalorieTarget(
    tdee,
    profile.goal,
    lifestyle.goalSpeed,
    profile.gender,
  );
  const { proteinTargetG, carbsTargetG, fatTargetG, fiberTargetG } = calculateMacroTargets(
    weightKg,
    dailyCalorieTarget,
    profile.goal,
    profile.gender,
  );
  const waterTargetMl = calculateWaterTargetMl(weightKg);

  const timestamp = nowIso();
  return {
    id: existing?.id ?? generateId(),
    userId: profile.id,
    bmi,
    bmiCategory,
    estimatedBodyFatPercentage,
    bmr,
    tdee,
    dailyCalorieTarget,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
    fiberTargetG,
    waterTargetMl,
    targetWeightKg: profile.targetWeightKg,
    weightToLoseKg,
    weightToGainKg,
    recommendation,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}
