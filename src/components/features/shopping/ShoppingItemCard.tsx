
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShoppingItemCardProps {
  id: string;
  name: string;
  completed: boolean;
  quantity?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string | null;
  notes?: string;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImagePreview?: () => void;
  readOnly?: boolean;
}

const ShoppingItemCard = ({
  name,
  completed,
  quantity,
  repeatOption,
  imageUrl,
  notes,
  onClick,
  onEdit,
  onDelete,
  onImagePreview,
  readOnly = false
}: ShoppingItemCardProps) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  // Base card style with background image if available
  const cardStyle = imageUrl 
    ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.7) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } 
    : { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' };
  
  // Larger card sizes with consistent dimensions for both mobile and desktop
  const cardSize = isMobile ? '130px' : '140px';

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger image preview if clicking on the card background
    if (onImagePreview && imageUrl && e.target === e.currentTarget) {
      onImagePreview();
    } else if (e.target === e.currentTarget) {
      // Otherwise toggle completion status
      onClick();
    }
  };

  // Improved button styling with consistent spacing and better visibility in dark mode
  const buttonSize = "w-12 h-12"; // Using fixed width/height for consistent spacing
  const buttonSpacing = "mx-0.5"; // Adding minimal horizontal spacing
  
  // Button background styling with better dark mode contrast
  const buttonBgClass = theme === 'dark' 
    ? "bg-white/80 hover:bg-white text-gray-800" 
    : "bg-white/70 hover:bg-white text-gray-800";

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 group",
        completed ? "opacity-70" : "opacity-100",
      )}
      style={{
        ...cardStyle,
        width: cardSize,
        height: cardSize,
        margin: '0' // Let the grid control spacing
      }}
      onClick={handleCardClick}
      role="button"
      aria-pressed={completed}
      tabIndex={0}
    >
      {/* Repeat Option Badge - Moved to top left for better visibility */}
      {repeatOption && repeatOption !== 'none' && (
        <Badge 
          variant="secondary" 
          className={cn(
            "absolute top-2 left-2 bg-white/80 text-black px-2 py-1",
            "text-xs shadow-sm z-10", // Improved visibility and positioning
            "dark:bg-black/60 dark:text-white" // Better dark mode contrast
          )}
        >
          {repeatOption}
        </Badge>
      )}
      
      {/* Edit Button - top-right with improved tap target */}
      <div className="absolute top-2 right-12 z-10">
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "rounded-full shadow-md",
            buttonBgClass,
            "transition-all duration-200 hover:scale-110", 
            buttonSize, // Using fixed size
            buttonSpacing, // Minimal horizontal spacing
            "dark:border dark:border-gray-600" // Better dark mode visibility
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={readOnly}
          aria-label={`Edit ${name}`}
        >
          <Pencil className={isMobile ? "h-4 w-4 stroke-[2.5px]" : "h-3.5 w-3.5 stroke-[2.5px]"} />
        </Button>
      </div>
      
      {/* Delete Button - top-right with improved tap target */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "rounded-full shadow-md",
            buttonBgClass,
            "transition-all duration-200 hover:scale-110",
            buttonSize, // Using fixed size
            buttonSpacing, // Minimal horizontal spacing
            "dark:border dark:border-gray-600" // Better dark mode visibility
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={readOnly}
          aria-label={`Delete ${name}`}
        >
          <Trash2 className={isMobile ? "h-4 w-4 stroke-[2.5px]" : "h-3.5 w-3.5 stroke-[2.5px]"} />
        </Button>
      </div>

      {/* Completion Status - centered checkmark */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {completed && (
          <div className="rounded-full bg-green-500/80 flex items-center justify-center h-12 w-12">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Item Name - positioned at bottom with gradient background */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className="text-white font-medium text-shadow truncate" 
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.2,
              fontSize: isMobile ? '0.9rem' : '0.85rem'
            }}>
          {name}
        </h3>
        {quantity && (
          <div className="flex items-center gap-1">
            <span className="text-white/90 text-shadow" 
                  style={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontSize: '0.75rem'
                  }}>
              {quantity}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ShoppingItemCard;
