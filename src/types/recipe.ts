export type DietaryRestriction = 
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'low-carb';

export interface RecipeFilters {
  dietary: DietaryRestriction[];
  servings: number;
  maxPrepTime?: number;
  maxCookTime?: number;
  category?: string;
}

export interface RecipeRating {
  score: number;
  count: number;
}

export interface RecipeMetadata {
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  rating: RecipeRating;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
