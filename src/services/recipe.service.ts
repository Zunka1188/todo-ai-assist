
import { Recipe, DietaryRestriction } from '@/types/recipe';
import { recipes as recipeData } from '@/data/recipes';

export interface RecipeFilters {
  dietary: DietaryRestriction[];
  maxPrepTime?: number;
  maxCookTime?: number;
  category?: string;
}

export class RecipeService {
  static getRecipeVariation(recipe: Recipe, dietaryRestrictions: DietaryRestriction[]): any[] {
    if (dietaryRestrictions.length === 0) {
      return recipe.ingredients.default;
    }

    // Handle vegan restriction first as it's the most restrictive
    if (dietaryRestrictions.includes('vegan') && recipe.ingredients.vegan) {
      return recipe.ingredients.vegan;
    }

    // Then vegetarian
    if (dietaryRestrictions.includes('vegetarian') && recipe.ingredients.vegetarian) {
      return recipe.ingredients.vegetarian;
    }

    // Start with the default ingredients
    let ingredients = [...recipe.ingredients.default];

    // Apply gluten-free substitutions
    if (dietaryRestrictions.includes('gluten-free') && recipe.ingredients.glutenFree) {
      ingredients = recipe.ingredients.glutenFree;
    }

    // Apply dairy-free substitutions
    if (dietaryRestrictions.includes('dairy-free') && recipe.ingredients.dairyFree) {
      ingredients = recipe.ingredients.dairyFree;
    }

    // Apply low-carb substitutions
    if (dietaryRestrictions.includes('low-carb') && recipe.ingredients.lowCarb) {
      ingredients = recipe.ingredients.lowCarb;
    }

    return ingredients;
  }

  static scaleIngredients(ingredients: any[], targetServings: number, baseServings: number): any[] {
    return ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.scalable 
        ? (ingredient.quantity * targetServings) / baseServings 
        : ingredient.quantity
    }));
  }

  static formatIngredient(ingredient: any): string {
    const quantity = ingredient.scalable 
      ? Math.round(ingredient.quantity * 10) / 10 // Round to 1 decimal place
      : ingredient.quantity;
    return `${quantity} ${ingredient.unit} ${ingredient.name}`;
  }

  static checkDietaryCompatibility(recipe: Recipe, restrictions: DietaryRestriction[]): boolean {
    for (const restriction of restrictions) {
      const key = this.mapRestrictionToKey(restriction);
      if (key && !recipe.dietaryInfo[key]) return false;
    }
    return true;
  }

  private static mapRestrictionToKey(restriction: DietaryRestriction): keyof Recipe['dietaryInfo'] | null {
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

  static filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
    return recipes.filter(recipe => {
      // Check dietary restrictions
      if (!this.checkDietaryCompatibility(recipe, filters.dietary)) {
        return false;
      }

      // Check prep time
      if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
        return false;
      }

      // Check cook time
      if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) {
        return false;
      }

      // Check category
      if (filters.category && recipe.category !== filters.category) {
        return false;
      }

      return true;
    });
  }

  static getIngredientsList(recipe: Recipe, servings: number, dietaryRestrictions: DietaryRestriction[]): string {
    const ingredients = this.getRecipeVariation(recipe, dietaryRestrictions);
    const scaledIngredients = this.scaleIngredients(ingredients, servings, recipe.baseServings);
    
    return scaledIngredients
      .map(ingredient => this.formatIngredient(ingredient))
      .join('\n');
  }
}
