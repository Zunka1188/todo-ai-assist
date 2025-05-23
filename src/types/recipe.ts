
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  scalable: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

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
  | "lebanese"
  | "mediterranean";

export interface Recipe {
  id: string;
  name: string;
  cuisine: Cuisine;
  category: "main" | "side" | "dessert" | "breakfast" | "snack" | "soup" | "appetizer";
  baseServings: number;
  prepTime: number;
  cookTime: number;
  calories: number;
  ingredients: {
    default: Ingredient[];
    vegan?: Ingredient[];
    vegetarian?: Ingredient[];
    glutenFree?: Ingredient[];
    dairyFree?: Ingredient[];
    lowCarb?: Ingredient[];
    nutFree?: Ingredient[];
  };
  instructions: string[];
  image: string;
  dietaryRestrictions?: string[];
  dietaryInfo: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isLowCarb: boolean;
    isNutFree: boolean;
  };
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export type DietaryRestriction = 
  | "vegan" 
  | "vegetarian" 
  | "gluten-free" 
  | "dairy-free" 
  | "nut-free" 
  | "low-carb";

export interface RecipeFilters {
  dietary: DietaryRestriction[];
  maxPrepTime?: number;
  maxCookTime?: number;
  category?: string;
}
