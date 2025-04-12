
export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  dietaryRestrictions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  image: string;
  nutrition?: NutritionInfo;
}

export type DietaryRestriction = 
  | "vegan" 
  | "vegetarian" 
  | "gluten-free" 
  | "dairy-free" 
  | "nut-free" 
  | "low-carb";

export type Cuisine = 
  | "italian" 
  | "french" 
  | "japanese" 
  | "chinese" 
  | "indian" 
  | "mexican" 
  | "thai" 
  | "polish" 
  | "greek" 
  | "spanish" 
  | "vietnamese" 
  | "korean" 
  | "turkish" 
  | "moroccan" 
  | "lebanese";
