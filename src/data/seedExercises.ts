import type { ExerciseItem } from '../types';
import { generateId, nowIso } from '../lib/id';

// Predefined starter exercise list per requirements doc section 11.1.
// Calorie-per-unit values are approximate reference estimates for an
// average adult — the user can override per log entry.
type SeedExercise = Omit<ExerciseItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>;

const SEED_EXERCISES: SeedExercise[] = [
  { name: 'Walking', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 4, intensity: 'low' },
  { name: 'Running', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 10, intensity: 'high' },
  { name: 'Cycling', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 8, intensity: 'medium' },
  { name: 'Push-ups', trackingType: 'count', unit: 'reps', caloriesBurnedPerUnit: 0.3, intensity: 'medium' },
  { name: 'Squats', trackingType: 'count', unit: 'reps', caloriesBurnedPerUnit: 0.32, intensity: 'medium' },
  { name: 'Plank', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 5, intensity: 'medium' },
  { name: 'Skipping', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 12, intensity: 'high' },
  { name: 'Yoga', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 3, intensity: 'low' },
  { name: 'Gym workout', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 7, intensity: 'medium' },
  { name: 'Swimming', trackingType: 'time', unit: 'minutes', caloriesBurnedPerUnit: 9, intensity: 'high' },
];

export function buildSeedExerciseItems(): ExerciseItem[] {
  const timestamp = nowIso();
  return SEED_EXERCISES.map((exercise) => ({
    ...exercise,
    id: generateId(),
    isCustom: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}
