
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  scalable: boolean;
}

export type Cuisine = 
  | 'thai' 
  | 'polish' 
  | 'french' 
  | 'italian' 
  | 'japanese' 
  | 'chinese' 
  | 'indian' 
  | 'mexican' 
  | 'greek' 
  | 'spanish' 
  | 'vietnamese' 
  | 'korean' 
  | 'turkish' 
  | 'moroccan' 
  | 'lebanese';

export interface Recipe {
  id: string;
  name: string;
  category: 'main' | 'side' | 'dessert' | 'breakfast' | 'snack' | 'soup' | 'appetizer';
  cuisine: Cuisine;
  baseServings: number; // Changed from 1 to number to match @/types/recipe
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
  image: string; // Add the required image property
}
