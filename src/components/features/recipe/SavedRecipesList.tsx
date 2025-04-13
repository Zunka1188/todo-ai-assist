
import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BookmarkIcon, Heart, Trash2, Clock, Utensils } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SavedRecipesListProps {
  showCustomOnly?: boolean;
  showFavoritesOnly?: boolean;
  showTitle?: boolean;
  className?: string;
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({ 
  showCustomOnly = false,
  showFavoritesOnly = false,
  showTitle = true,
  className
}) => {
  const { 
    userRecipes, 
    customRecipes,
    favorites,
    isLoadingUserRecipes, 
    removeSavedRecipe, 
    isRemoving,
    toggleFavorite,
    isRecipeFavorite
  } = useRecipes();
  
  // Filter recipes based on the props
  const getFilteredRecipes = () => {
    if (showCustomOnly) {
      return customRecipes;
    }
    
    if (showFavoritesOnly && userRecipes) {
      return userRecipes.filter(recipe => favorites.includes(recipe.id));
    }
    
    return userRecipes || [];
  };
  
  const recipesToShow = getFilteredRecipes();
  
  if (isLoadingUserRecipes) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-2xl font-semibold">Your Saved Recipes</h2>}
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-20 mr-2" />
              <Skeleton className="h-9 w-9" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!recipesToShow || recipesToShow.length === 0) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-semibold">
            {showCustomOnly 
              ? 'Your Custom Recipes' 
              : showFavoritesOnly
                ? 'Your Favorite Recipes'
                : 'Your Saved Recipes'
            }
          </h2>
        )}
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium">
              {showCustomOnly 
                ? "You haven't created any custom recipes yet."
                : showFavoritesOnly
                  ? "You haven't added any favorites yet."
                  : "No recipes saved yet."}
            </h3>
            <p className="text-muted-foreground mt-2">
              {showCustomOnly 
                ? "You haven't created any custom recipes yet."
                : showFavoritesOnly
                  ? "Mark recipes as favorites for quick access."
                  : "Save recipes you love to access them quickly later."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/recipes">Browse Recipes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {showTitle && (
        <h2 className="text-2xl font-semibold">
          {showCustomOnly 
            ? 'Your Custom Recipes' 
            : showFavoritesOnly
              ? 'Your Favorite Recipes'
              : 'Your Saved Recipes'
          }
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipesToShow.map((recipe) => (
          <RecipeCard 
            key={recipe.id}
            recipe={recipe}
            isFavorite={isRecipeFavorite(recipe.id)}
            onRemove={() => removeSavedRecipe(recipe.id)}
            onToggleFavorite={() => toggleFavorite(recipe.id)}
            isRemoving={isRemoving}
          />
        ))}
      </div>
    </div>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onRemove: () => void;
  onToggleFavorite: () => void;
  isRemoving: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  isFavorite, 
  onRemove, 
  onToggleFavorite,
  isRemoving
}) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
        <CardDescription>{recipe.cuisine} Cuisine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" /> 
          <span>Prep: {recipe.prepTime} min</span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 mr-1" /> 
          <span>Cook: {recipe.cookTime} min</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.dietaryInfo.isVegan && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-100">
              Vegan
            </span>
          )}
          {recipe.dietaryInfo.isVegetarian && !recipe.dietaryInfo.isVegan && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-100">
              Vegetarian
            </span>
          )}
          {recipe.dietaryInfo.isGlutenFree && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-100">
              Gluten-Free
            </span>
          )}
          {recipe.dietaryInfo.isDairyFree && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-100">
              Dairy-Free
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link to={`/recipes/${recipe.id}`} className="flex items-center">
            <Utensils className="h-4 w-4 mr-2" />
            View Recipe
          </Link>
        </Button>
        <div className="flex space-x-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} 
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            disabled={isRemoving}
            aria-label="Remove recipe"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SavedRecipesList;
