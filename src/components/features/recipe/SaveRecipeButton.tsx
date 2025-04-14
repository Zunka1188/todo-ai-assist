
import React from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

interface SaveRecipeButtonProps {
  recipe: Recipe;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Button component for saving a recipe to the user's collection
 */
const SaveRecipeButton: React.FC<SaveRecipeButtonProps> = ({ 
  recipe, 
  variant = 'outline', 
  size = 'default',
  className,
  onSaveSuccess,
  onSaveError
}) => {
  const { saveRecipe, removeSavedRecipe, isRecipeSaved, isSaving, isRemoving } = useRecipes();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const isSaved = isRecipeSaved(recipe.id);
  const isLoading = isSaving || isRemoving;
  
  const handleClick = async () => {
    try {
      if (isSaved) {
        await removeSavedRecipe(recipe.id);
        toast({
          title: t('recipes.removed'),
          description: t('recipes.removedDescription')
        });
      } else {
        await saveRecipe(recipe);
        toast({
          title: t('recipes.saved'),
          description: t('recipes.savedDescription')
        });
        onSaveSuccess?.();
      }
    } catch (error) {
      console.error('Error saving/removing recipe:', error);
      toast({
        title: t('common.error'),
        description: isSaved 
          ? t('recipes.errorRemoving') 
          : t('recipes.errorSaving'),
        variant: 'destructive'
      });
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
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
            {isLoading ? (
              <Loader2 className={cn("h-4 w-4", size !== 'icon' && "mr-2")} />
            ) : (
              size === 'icon' ? (
                isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />
              ) : (
                <>
                  {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                  {isSaved ? t('common.saved') : t('recipes.saveRecipe')}
                </>
              )
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLoading 
            ? t('common.processing')
            : (isSaved ? t('recipes.removeRecipe') : t('recipes.saveRecipe'))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveRecipeButton;
