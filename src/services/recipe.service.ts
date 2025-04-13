
import { Recipe, DietaryRestriction } from '@/types/recipe';

export interface RecipeFilters {
  dietary: DietaryRestriction[];
  maxPrepTime?: number;
  maxCookTime?: number;
  category?: string;
}

export const recipe = {
  // Utility functions that might be needed for compatibility
  checkDietaryCompatibility(recipe: Recipe, restrictions: DietaryRestriction[]): boolean {
    for (const restriction of restrictions) {
      const key = this.mapRestrictionToKey(restriction);
      if (key && !recipe.dietaryInfo[key]) return false;
    }
    return true;
  },

  mapRestrictionToKey(restriction: DietaryRestriction): keyof Recipe['dietaryInfo'] | null {
    switch (restriction) {
      case 'vegan': return 'isVegan';
      case 'vegetarian': return 'isVegetarian';
      case 'gluten-free': return 'isGlutenFree';
      case 'dairy-free': return 'isDairyFree';
      case 'low-carb': return 'isLowCarb';
      case 'nut-free': return 'isNutFree';
      default: return null;
    }
  }
};
