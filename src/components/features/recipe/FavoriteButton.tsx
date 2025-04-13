
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteButtonProps {
  recipeId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  recipeId, 
  variant = 'ghost', 
  size = 'icon',
  className 
}) => {
  const { toggleFavorite, isRecipeFavorite } = useRecipes();
  
  const isFavorite = isRecipeFavorite(recipeId);
  
  const handleClick = () => {
    toggleFavorite(recipeId);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={cn(className)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {size === 'icon' ? (
              <Heart 
                className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")}
              />
            ) : (
              <>
                <Heart 
                  className={cn("mr-2 h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteButton;
