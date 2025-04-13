
import React from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
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
            aria-label={isSaved ? t('recipes.removeFromFavorites') : t('recipes.saveRecipe')}
          >
            {size === 'icon' ? (
              isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />
            ) : (
              <>
                {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {isSaved ? t('common.saved') : t('recipes.saveRecipe')}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSaved ? t('recipes.removeRecipe') : t('recipes.saveRecipe')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveRecipeButton;
