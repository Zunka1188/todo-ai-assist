
import React from 'react';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface SaveRecipeFabProps {
  recipe: Recipe;
  className?: string;
}

const SaveRecipeFab: React.FC<SaveRecipeFabProps> = ({ recipe, className }) => {
  const { saveRecipe, removeSavedRecipe, isRecipeSaved, toggleFavorite, isRecipeFavorite } = useRecipes();
  
  const isSaved = isRecipeSaved(recipe.id);
  const isFavorite = isRecipeFavorite(recipe.id);
  
  const handleSaveClick = () => {
    if (isSaved) {
      removeSavedRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
  };
  
  const handleFavoriteClick = () => {
    toggleFavorite(recipe.id);
  };
  
  const handleShare = () => {
    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: `Check out this ${recipe.cuisine} recipe: ${recipe.name}`,
        url: window.location.href,
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: 'Failed to share recipe',
          variant: 'destructive'
        });
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Recipe link copied to clipboard'
      });
    }
  };
  
  return (
    <div className={cn("fixed bottom-6 right-6 flex gap-2", className)}>
      <Button 
        size="icon" 
        variant={isSaved ? "default" : "secondary"} 
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={handleSaveClick}
        aria-label={isSaved ? "Remove from saved recipes" : "Save recipe"}
      >
        <Bookmark className={cn("h-6 w-6", isSaved ? "fill-white" : "")} />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-14 w-14 rounded-full shadow-lg bg-background"
            aria-label="More options"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleFavoriteClick}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>Share Recipe</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SaveRecipeFab;
