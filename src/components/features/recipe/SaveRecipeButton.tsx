
import React from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SaveRecipeButtonProps {
  recipe: Recipe;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const SaveRecipeButton: React.FC<SaveRecipeButtonProps> = ({ 
  recipe, 
  variant = 'outline', 
  size = 'default',
  className 
}) => {
  const { saveRecipe, removeSavedRecipe, isRecipeSaved, isSaving, isRemoving } = useRecipes();
  
  const isSaved = isRecipeSaved(recipe.id);
  const isLoading = isSaving || isRemoving;
  
  const handleClick = () => {
    if (isSaved) {
      removeSavedRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={isLoading}
            className={cn(className)}
            aria-label={isSaved ? "Remove from saved recipes" : "Save recipe"}
          >
            {size === 'icon' ? (
              isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />
            ) : (
              <>
                {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {isSaved ? "Saved" : "Save Recipe"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSaved ? "Remove from saved recipes" : "Save recipe for later"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveRecipeButton;
