
import { Recipe } from '@/types/recipe';
import { appCache } from '@/utils/cacheUtils';
import { logger } from '@/utils/logger';

// Local storage key for saved recipes
const SAVED_RECIPES_KEY = 'user_saved_recipes';
const FAVORITES_KEY = 'user_favorite_recipes';
const CUSTOM_RECIPES_KEY = 'user_custom_recipes';

/**
 * Service for managing user's saved and custom recipes
 */
export class UserRecipeService {
  /**
   * Save a recipe to user's collection
   */
  static saveRecipe(recipe: Recipe): Recipe[] {
    try {
      const savedRecipes = this.getSavedRecipes();
      
      // Check if recipe already exists
      const existingIndex = savedRecipes.findIndex(r => r.id === recipe.id);
      if (existingIndex >= 0) {
        // Update existing recipe
        savedRecipes[existingIndex] = recipe;
      } else {
        // Add new recipe
        savedRecipes.push(recipe);
      }
      
      // Sort recipes by name
      savedRecipes.sort((a, b) => a.name.localeCompare(b.name));
      
      // Save to local storage
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
      
      // Update cache
      appCache.set('savedRecipes', savedRecipes);
      
      return savedRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to save recipe:', error);
      throw new Error('Failed to save recipe');
    }
  }
  
  /**
   * Get all saved recipes
   */
  static getSavedRecipes(): Recipe[] {
    try {
      // Check cache first
      const cachedRecipes = appCache.get<Recipe[]>('savedRecipes');
      if (cachedRecipes) {
        return cachedRecipes;
      }
      
      // Try to get from local storage
      const savedRecipesJson = localStorage.getItem(SAVED_RECIPES_KEY);
      if (!savedRecipesJson) {
        return [];
      }
      
      const savedRecipes = JSON.parse(savedRecipesJson) as Recipe[];
      
      // Update cache
      appCache.set('savedRecipes', savedRecipes);
      
      return savedRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to get saved recipes:', error);
      return [];
    }
  }
  
  /**
   * Remove a saved recipe
   */
  static removeSavedRecipe(recipeId: string): Recipe[] {
    try {
      const savedRecipes = this.getSavedRecipes();
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
      
      // Save to local storage
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
      
      // Update cache
      appCache.set('savedRecipes', updatedRecipes);
      
      return updatedRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to remove recipe:', error);
      throw new Error('Failed to remove recipe');
    }
  }
  
  /**
   * Toggle favorite status for a recipe
   */
  static toggleFavorite(recipeId: string): boolean {
    try {
      const favorites = this.getFavorites();
      const isFavorite = favorites.includes(recipeId);
      
      let updatedFavorites: string[];
      
      if (isFavorite) {
        // Remove from favorites
        updatedFavorites = favorites.filter(id => id !== recipeId);
      } else {
        // Add to favorites
        updatedFavorites = [...favorites, recipeId];
      }
      
      // Save to local storage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      // Update cache
      appCache.set('favoriteRecipes', updatedFavorites);
      
      return !isFavorite; // Return the new status
    } catch (error) {
      logger.error('[UserRecipeService] Failed to toggle favorite:', error);
      throw new Error('Failed to update favorite status');
    }
  }
  
  /**
   * Get all favorite recipe IDs
   */
  static getFavorites(): string[] {
    try {
      // Check cache first
      const cachedFavorites = appCache.get<string[]>('favoriteRecipes');
      if (cachedFavorites) {
        return cachedFavorites;
      }
      
      // Try to get from local storage
      const favoritesJson = localStorage.getItem(FAVORITES_KEY);
      if (!favoritesJson) {
        return [];
      }
      
      const favorites = JSON.parse(favoritesJson) as string[];
      
      // Update cache
      appCache.set('favoriteRecipes', favorites);
      
      return favorites;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to get favorites:', error);
      return [];
    }
  }
  
  /**
   * Check if a recipe is favorited
   */
  static isFavorite(recipeId: string): boolean {
    return this.getFavorites().includes(recipeId);
  }
  
  /**
   * Add or update a custom recipe
   */
  static saveCustomRecipe(recipe: Recipe): Recipe[] {
    try {
      const customRecipes = this.getCustomRecipes();
      
      // Check if recipe already exists
      const existingIndex = customRecipes.findIndex(r => r.id === recipe.id);
      if (existingIndex >= 0) {
        // Update existing recipe
        customRecipes[existingIndex] = recipe;
      } else {
        // Add new recipe with generated ID if needed
        if (!recipe.id) {
          recipe.id = `custom-${Date.now()}`;
        }
        customRecipes.push(recipe);
      }
      
      // Sort recipes by name
      customRecipes.sort((a, b) => a.name.localeCompare(b.name));
      
      // Save to local storage
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customRecipes));
      
      // Update cache
      appCache.set('customRecipes', customRecipes);
      
      return customRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to save custom recipe:', error);
      throw new Error('Failed to save custom recipe');
    }
  }
  
  /**
   * Get all custom recipes
   */
  static getCustomRecipes(): Recipe[] {
    try {
      // Check cache first
      const cachedRecipes = appCache.get<Recipe[]>('customRecipes');
      if (cachedRecipes) {
        return cachedRecipes;
      }
      
      // Try to get from local storage
      const customRecipesJson = localStorage.getItem(CUSTOM_RECIPES_KEY);
      if (!customRecipesJson) {
        return [];
      }
      
      const customRecipes = JSON.parse(customRecipesJson) as Recipe[];
      
      // Update cache
      appCache.set('customRecipes', customRecipes);
      
      return customRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to get custom recipes:', error);
      return [];
    }
  }
  
  /**
   * Remove a custom recipe
   */
  static removeCustomRecipe(recipeId: string): Recipe[] {
    try {
      const customRecipes = this.getCustomRecipes();
      const updatedRecipes = customRecipes.filter(recipe => recipe.id !== recipeId);
      
      // Save to local storage
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(updatedRecipes));
      
      // Update cache
      appCache.set('customRecipes', updatedRecipes);
      
      return updatedRecipes;
    } catch (error) {
      logger.error('[UserRecipeService] Failed to remove custom recipe:', error);
      throw new Error('Failed to remove custom recipe');
    }
  }
  
  /**
   * Get all recipes (saved + custom)
   */
  static getAllUserRecipes(): Recipe[] {
    const savedRecipes = this.getSavedRecipes();
    const customRecipes = this.getCustomRecipes();
    
    // Combine and sort
    return [...savedRecipes, ...customRecipes].sort((a, b) => a.name.localeCompare(b.name));
  }
}
