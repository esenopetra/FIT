// Data models per requirements doc section 12.

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type Goal = 'lose_weight' | 'gain_weight' | 'maintain_weight';
export type FoodPreference = 'veg' | 'non_veg' | 'eggetarian' | 'vegan' | 'mixed';

export type UserProfile = {
  id: string;
  name: string;
  gender: Gender;
  dob: string;
  heightValue: number;
  heightUnit: 'cm' | 'ft_in';
  weightValue: number;
  weightUnit: 'kg' | 'lb';
  goal: Goal;
  targetWeightKg?: number;
  foodPreference?: FoodPreference;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseFrequency = 'rarely' | 'one_two_days' | 'three_four_days' | 'five_six_days' | 'daily';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
export type YesNoSometimes = 'no' | 'sometimes' | 'yes';
export type GoalSpeed = 'slow' | 'moderate' | 'aggressive';

export type LifestyleQuestionnaire = {
  id: string;
  userId: string;
  exerciseFrequency: ExerciseFrequency;
  activityLevel: ActivityLevel;
  drinksEnoughWater: YesNoSometimes;
  currentWaterMlPerDay?: number;
  walksDaily: YesNoSometimes;
  goalSpeed: GoalSpeed;
  createdAt: string;
  updatedAt: string;
};

export type HealthGoals = {
  id: string;
  userId: string;
  bmi: number;
  bmiCategory: string;
  estimatedBodyFatPercentage?: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
  targetWeightKg?: number;
  weightToLoseKg?: number;
  weightToGainKg?: number;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
};

export type FoodUnitType = 'number' | 'gram' | 'ml' | 'serving' | 'cup' | 'spoon';

export type FoodItem = {
  id: string;
  name: string;
  unitType: FoodUnitType;
  servingSize: number;
  caloriesPerUnit: number;
  proteinPerUnitG: number;
  carbsPerUnitG: number;
  fatPerUnitG: number;
  fiberPerUnitG?: number;
  sugarPerUnitG?: number;
  sodiumPerUnitMg?: number;
  category?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type FoodLog = {
  id: string;
  userId: string;
  foodItemId: string;
  foodNameSnapshot: string;
  mealCategory: MealCategory;
  quantity: number;
  unitType: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG?: number;
  logDate: string;
  logTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WaterLog = {
  id: string;
  userId: string;
  amountMl: number;
  logDate: string;
  logTime?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseTrackingType = 'time' | 'count' | 'distance' | 'custom';
export type ExerciseUnit = 'minutes' | 'reps' | 'km' | 'sets' | 'custom';
export type Intensity = 'low' | 'medium' | 'high';

export type ExerciseItem = {
  id: string;
  name: string;
  trackingType: ExerciseTrackingType;
  unit: ExerciseUnit;
  caloriesBurnedPerUnit: number;
  intensity?: Intensity;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseLog = {
  id: string;
  userId: string;
  exerciseItemId: string;
  exerciseNameSnapshot: string;
  quantity: number;
  unit: string;
  caloriesBurned: number;
  logDate: string;
  logTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WeightLog = {
  id: string;
  userId: string;
  weightKg: number;
  logDate: string;
  createdAt: string;
};

// Not in the spec's explicit data model list, but the app_settings table is
// referenced in section 13 — this backs unit preferences and target overrides.
export type AppSettings = {
  id: string;
  userId: string;
  heightUnit: 'cm' | 'ft_in';
  weightUnit: 'kg' | 'lb';
  waterUnit: 'ml' | 'liter';
  waterTargetOverrideMl?: number;
  createdAt: string;
  updatedAt: string;
};
