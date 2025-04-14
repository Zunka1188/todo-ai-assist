
import React from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SaveRecipeButtonProps {
  recipe: Recipe;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  testId?: string; // Added for testing purposes
}

/**
 * Button component for saving a recipe to the user's collection
 * 
 * @component
 * @example
 * ```tsx
 * <SaveRecipeButton 
 *   recipe={recipe} 
 *   variant="outline" 
 *   size="default" 
 *   onSaveSuccess={handleSaveSuccess} 
 *   onSaveError={handleSaveError} 
 * />
 * ```
 */
const SaveRecipeButton: React.FC<SaveRecipeButtonProps> = ({ 
  recipe, 
  variant = 'outline', 
  size = 'default',
  className,
  onSaveSuccess,
  onSaveError,
  testId = 'save-recipe-button'
}) => {
  const { saveRecipe, removeSavedRecipe, isRecipeSaved, isSaving, isRemoving } = useRecipes();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
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
  
  // Adjust size for mobile devices
  const effectiveSize = isMobile && size !== 'icon' ? 'lg' : size;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={effectiveSize}
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
              isMobile ? 'w-full justify-center' : '',
              className
            )}
            aria-label={isSaved ? t('recipes.removeFromFavorites') : t('recipes.saveRecipe')}
            data-testid={testId}
            data-state={isSaved ? 'saved' : 'not-saved'}
          >
            {isLoading ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", size !== 'icon' && "mr-2")} />
            ) : (
              effectiveSize === 'icon' ? (
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
