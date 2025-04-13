
import { useState, useEffect, useCallback } from 'react';
import { Recipe, DietaryRestriction } from '@/types/recipe';
import { RecipeService } from '@/services/RecipeService';
import { recipe } from '@/services/recipe.service'; // Import the recipe service with compatibility functions
import { UserRecipeService } from '@/services/userRecipeService';
import { useToast } from '@/hooks/use-toast';
import { useCachedQuery, useCachingMutation } from '@/hooks/use-cached-query';
import { logger } from '@/utils/logger';
import { QueryFunctionContext } from '@tanstack/react-query';

interface RecipeFilters {
  query?: string;
  cuisine?: string;
  dietary?: DietaryRestriction[];
  maxPrepTime?: number;
  maxCookTime?: number;
}

/**
 * Hook for recipe management including saving, filtering, etc.
 */
export const useRecipes = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  
  // Load user data on mount
  useEffect(() => {
    try {
      const savedRecipes = UserRecipeService.getSavedRecipes();
      const favorites = UserRecipeService.getFavorites();
      const customRecipes = UserRecipeService.getCustomRecipes();
      
      setSavedRecipes(savedRecipes);
      setFavorites(favorites);
      setCustomRecipes(customRecipes);
    } catch (error) {
      logger.error('[useRecipes] Error loading user recipe data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your saved recipes',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Get all recipes with filtering
  const getAllRecipes = useCallback(async (_context: QueryFunctionContext<any>): Promise<Recipe[]> => {
    let recipes = RecipeService.getAllRecipes();
    
    // Apply filters
    if (filters.query) {
      recipes = RecipeService.searchRecipesByName(filters.query);
    }
    
    if (filters.cuisine) {
      recipes = recipes.filter(recipe => recipe.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
    }
    
    if (filters.dietary && filters.dietary.length > 0) {
      recipes = recipes.filter(recipe => 
        filters.dietary!.every(requirement => {
          // Using recipe service utility function for compatibility
          const key = mapDietaryRestrictionToKey(requirement);
          return key ? recipe.dietaryInfo[key] : true;
        })
      );
    }
    
    if (filters.maxPrepTime) {
      recipes = recipes.filter(recipe => recipe.prepTime <= filters.maxPrepTime!);
    }
    
    if (filters.maxCookTime) {
      recipes = recipes.filter(recipe => recipe.cookTime <= filters.maxCookTime!);
    }
    
    return recipes;
  }, [filters]);
  
  // Helper function to map dietary restriction to key
  const mapDietaryRestrictionToKey = (restriction: DietaryRestriction): keyof Recipe['dietaryInfo'] | null => {
    switch (restriction) {
      case 'vegan': return 'isVegan';
      case 'vegetarian': return 'isVegetarian';
      case 'gluten-free': return 'isGlutenFree';
      case 'dairy-free': return 'isDairyFree';
      case 'low-carb': return 'isLowCarb';
      case 'nut-free': return 'isNutFree';
      default: return null;
    }
  };
  
  // Use React Query to cache recipe data
  const { data: recipes, isLoading: isLoadingRecipes, error: recipesError } = useCachedQuery(
    ['recipes', filters],
    getAllRecipes,
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );
  
  // Save recipe mutation
  const { mutate: saveRecipe, isPending: isSaving } = useCachingMutation<Recipe[], Recipe>(
    async (recipe) => {
      const updatedRecipes = UserRecipeService.saveRecipe(recipe);
      setSavedRecipes(updatedRecipes);
      return updatedRecipes;
    },
    {
      onSuccess: (_, recipe) => {
        toast({
          title: 'Recipe Saved',
          description: `"${recipe.name}" has been saved to your collection.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to save recipe',
          variant: 'destructive'
        });
        logger.error('[useRecipes] Error saving recipe:', error);
      }
    }
  );
  
  // Remove saved recipe mutation
  const { mutate: removeSavedRecipe, isPending: isRemoving } = useCachingMutation<Recipe[], string>(
    async (recipeId) => {
      const updatedRecipes = UserRecipeService.removeSavedRecipe(recipeId);
      setSavedRecipes(updatedRecipes);
      return updatedRecipes;
    },
    {
      onSuccess: (_, recipeId) => {
        const recipeName = savedRecipes.find(r => r.id === recipeId)?.name || 'Recipe';
        toast({
          title: 'Recipe Removed',
          description: `"${recipeName}" has been removed from your collection.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to remove recipe',
          variant: 'destructive'
        });
        logger.error('[useRecipes] Error removing recipe:', error);
      }
    }
  );
  
  // Toggle favorite mutation
  const { mutate: toggleFavorite } = useCachingMutation<boolean, string>(
    async (recipeId) => {
      const isFavorite = UserRecipeService.toggleFavorite(recipeId);
      const updatedFavorites = UserRecipeService.getFavorites();
      setFavorites(updatedFavorites);
      return isFavorite;
    },
    {
      onSuccess: (isFavorite, recipeId) => {
        const allRecipes = [...(recipes || []), ...savedRecipes, ...customRecipes];
        const recipeName = allRecipes.find(r => r.id === recipeId)?.name || 'Recipe';
        
        toast({
          title: isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
          description: isFavorite 
            ? `"${recipeName}" has been added to your favorites.`
            : `"${recipeName}" has been removed from your favorites.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to update favorites',
          variant: 'destructive'
        });
        logger.error('[useRecipes] Error updating favorites:', error);
      }
    }
  );
  
  // Save custom recipe mutation
  const { mutate: saveCustomRecipe, isPending: isSavingCustom } = useCachingMutation<Recipe[], Recipe>(
    async (recipe) => {
      const updatedRecipes = UserRecipeService.saveCustomRecipe(recipe);
      setCustomRecipes(updatedRecipes);
      return updatedRecipes;
    },
    {
      onSuccess: (_, recipe) => {
        toast({
          title: 'Custom Recipe Saved',
          description: `"${recipe.name}" has been saved to your collection.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to save custom recipe',
          variant: 'destructive'
        });
        logger.error('[useRecipes] Error saving custom recipe:', error);
      }
    }
  );
  
  // Get all user recipes (saved + custom)
  const getUserRecipes = useCallback(async (_context: QueryFunctionContext<any>): Promise<Recipe[]> => {
    return UserRecipeService.getAllUserRecipes();
  }, []);
  
  // Use React Query to cache user recipe data
  const { 
    data: userRecipes, 
    isLoading: isLoadingUserRecipes, 
    refetch: refetchUserRecipes 
  } = useCachedQuery(['userRecipes'], getUserRecipes, { staleTime: 2 * 60 * 1000 }); // 2 minutes
  
  // Check if a recipe is saved
  const isRecipeSaved = useCallback((recipeId: string) => {
    return savedRecipes.some(recipe => recipe.id === recipeId);
  }, [savedRecipes]);
  
  // Check if a recipe is a favorite
  const isRecipeFavorite = useCallback((recipeId: string) => {
    return favorites.includes(recipeId);
  }, [favorites]);
  
  return {
    recipes: recipes || [],
    userRecipes: userRecipes || [],
    savedRecipes,
    customRecipes,
    favorites,
    isLoadingRecipes,
    isLoadingUserRecipes,
    isSaving,
    isRemoving,
    isSavingCustom,
    recipesError,
    filters,
    setFilters,
    saveRecipe,
    removeSavedRecipe,
    toggleFavorite,
    isRecipeSaved,
    isRecipeFavorite,
    saveCustomRecipe,
    refetchUserRecipes
  };
};
