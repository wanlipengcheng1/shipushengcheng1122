
export enum Gender {
  Male = '男',
  Female = '女',
}

export enum Goal {
  LoseWeight = '减脂',
  Maintain = '维持',
  GainMuscle = '增肌',
}

export enum ActivityLevel {
  Sedentary = '久坐不动 (办公室工作)',
  LightlyActive = '轻度活动 (每周运动1-3次)',
  ModeratelyActive = '中度活动 (每周运动3-5次)',
  VeryActive = '高度活动 (每周运动6-7次)',
}

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  dislikes: string; // comma separated
  dietStyle: string; // e.g., low carb, balanced
  model: string; // AI Model selection
}

export interface Ingredient {
  name: string;
  amount: string; // e.g. "50g" or "1个"
  category: string; // e.g. "Vegetable", "Meat"
}

export interface Macronutrients {
  protein: number; // g
  fat: number; // g
  carbs: number; // g
}

export interface Meal {
  name: string;
  calories: number;
  macronutrients: Macronutrients;
  ingredients: Ingredient[];
  recipeSteps: string[];
  description: string;
}

export interface DailyPlan {
  day: number;
  totalCalories: number;
  totalMacronutrients: Macronutrients;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
  };
  nutritionTips: string;
}

export interface WeeklyPlan {
  weeklyOverview: string;
  dailyPlans: DailyPlan[];
  shoppingList: Record<string, string[]>; // category -> items
}
