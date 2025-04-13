
import { Recipe } from '@/types/recipe';
import { recipes as recipeData } from '@/data/recipes';

export class RecipeService {
  // Get all recipes
  static getAllRecipes(): Recipe[] {
    return recipeData as unknown as Recipe[];
  }

  // Search recipes by name
  static searchRecipesByName(query: string): Recipe[] {
    const searchTerm = query.toLowerCase();
    return (recipeData as unknown as Recipe[]).filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm)
    );
  }

  // Filter recipes by cuisine
  static getRecipesByCuisine(cuisine: string): Recipe[] {
    return (recipeData as unknown as Recipe[]).filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  // Filter recipes by dietary requirements
  static getRecipesByDiet(dietaryRequirements: Array<keyof Recipe['dietaryInfo']>): Recipe[] {
    return (recipeData as unknown as Recipe[]).filter(recipe => 
      dietaryRequirements.every(requirement => {
        if (requirement in recipe.dietaryInfo) {
          return recipe.dietaryInfo[requirement];
        }
        return false;
      })
    );
  }

  // Get recipe by ID
  static getRecipeById(id: string): Recipe | undefined {
    return (recipeData as unknown as Recipe[]).find(recipe => recipe.id === id);
  }

  // Get recipe suggestions based on preferences
  static getSuggestedRecipes(preferences: {
    cuisine?: string;
    dietary?: Array<keyof Recipe['dietaryInfo']>;
    maxCalories?: number;
    maxPrepTime?: number;
  }): Recipe[] {
    let filteredRecipes = [...(recipeData as unknown as Recipe[])];

    if (preferences.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.cuisine.toLowerCase() === preferences.cuisine?.toLowerCase()
      );
    }

    if (preferences.dietary?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        preferences.dietary?.every(requirement => {
          if (requirement in recipe.dietaryInfo) {
            return recipe.dietaryInfo[requirement];
          }
          return false;
        })
      );
    }

    if (preferences.maxCalories) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.nutritionalInfo.calories <= preferences.maxCalories!
      );
    }

    if (preferences.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.prepTime <= preferences.maxPrepTime!
      );
    }

    return filteredRecipes;
  }

  // Scale recipe ingredients for different serving sizes
  static scaleRecipe(recipe: Recipe, servings: number): Recipe {
    const scaleFactor = servings / recipe.baseServings;
    
    const scaleIngredients = (ingredients: Recipe['ingredients']['default']) => {
      return ingredients.map(ingredient => ({
        ...ingredient,
        quantity: ingredient.scalable ? ingredient.quantity * scaleFactor : ingredient.quantity
      }));
    };

    return {
      ...recipe,
      ingredients: {
        default: scaleIngredients(recipe.ingredients.default),
        ...(recipe.ingredients.vegan && { vegan: scaleIngredients(recipe.ingredients.vegan) }),
        ...(recipe.ingredients.vegetarian && { vegetarian: scaleIngredients(recipe.ingredients.vegetarian) }),
        ...(recipe.ingredients.glutenFree && { glutenFree: scaleIngredients(recipe.ingredients.glutenFree) }),
        ...(recipe.ingredients.dairyFree && { dairyFree: scaleIngredients(recipe.ingredients.dairyFree) }),
        ...(recipe.ingredients.lowCarb && { lowCarb: scaleIngredients(recipe.ingredients.lowCarb) }),
        ...(recipe.ingredients.nutFree && { nutFree: scaleIngredients(recipe.ingredients.nutFree) })
      }
    };
  }

  // Get similar recipes
  static getSimilarRecipes(recipeId: string, limit: number = 3): Recipe[] {
    const targetRecipe = this.getRecipeById(recipeId);
    if (!targetRecipe) return [];

    return (recipeData as unknown as Recipe[])
      .filter(recipe => recipe.id !== recipeId)
      .map(recipe => ({
        recipe,
        score: this.calculateSimilarityScore(targetRecipe, recipe)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.recipe);
  }

  // Calculate similarity score between two recipes
  private static calculateSimilarityScore(recipe1: Recipe, recipe2: Recipe): number {
    let score = 0;

    // Same cuisine
    if (recipe1.cuisine === recipe2.cuisine) score += 3;

    // Similar dietary requirements
    const dietaryKeys = Object.keys(recipe1.dietaryInfo) as Array<keyof Recipe['dietaryInfo']>;
    const dietaryMatch = dietaryKeys.filter(key => 
      recipe1.dietaryInfo[key] === recipe2.dietaryInfo[key]
    ).length;
    score += dietaryMatch * 0.5;

    // Similar calorie range (within 100 cal)
    if (Math.abs(recipe1.calories - recipe2.calories) <= 100) score += 1;

    // Similar preparation time (within 15 minutes)
    if (Math.abs(recipe1.prepTime - recipe2.prepTime) <= 15) score += 1;

    return score;
  }
}
