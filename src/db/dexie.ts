import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  LifestyleQuestionnaire,
  HealthGoals,
  FoodItem,
  FoodLog,
  WaterLog,
  ExerciseItem,
  ExerciseLog,
  WeightLog,
  AppSettings,
} from '../types';

// IndexedDB tables per requirements doc section 13.
export class FoodTrackerDB extends Dexie {
  user_profiles!: EntityTable<UserProfile, 'id'>;
  lifestyle_questionnaires!: EntityTable<LifestyleQuestionnaire, 'id'>;
  health_goals!: EntityTable<HealthGoals, 'id'>;
  food_items!: EntityTable<FoodItem, 'id'>;
  food_logs!: EntityTable<FoodLog, 'id'>;
  water_logs!: EntityTable<WaterLog, 'id'>;
  exercise_items!: EntityTable<ExerciseItem, 'id'>;
  exercise_logs!: EntityTable<ExerciseLog, 'id'>;
  weight_logs!: EntityTable<WeightLog, 'id'>;
  app_settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('FoodTrackerDB');
    this.version(1).stores({
      user_profiles: 'id, name, createdAt',
      lifestyle_questionnaires: 'id, userId, createdAt',
      health_goals: 'id, userId, createdAt',
      food_items: 'id, name, isCustom, category',
      food_logs: 'id, userId, foodItemId, logDate, mealCategory, [userId+logDate]',
      water_logs: 'id, userId, logDate, [userId+logDate]',
      exercise_items: 'id, name, isCustom',
      exercise_logs: 'id, userId, exerciseItemId, logDate, [userId+logDate]',
      weight_logs: 'id, userId, logDate',
      app_settings: 'id, userId',
    });
  }
}

export const db = new FoodTrackerDB();
