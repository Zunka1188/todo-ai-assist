
import React from 'react';
import { Pencil } from 'lucide-react';
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
  onDelete?: () => void;
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
  
  // Increased card dimensions for mobile based on the user's screenshots
  // The first image shows smaller cards, the second shows desired larger cards
  const cardSize = isMobile ? '140px' : '130px';

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger image preview if clicking on the card background
    if (onImagePreview && imageUrl && e.target === e.currentTarget) {
      onImagePreview();
    } else if (e.target === e.currentTarget) {
      // Otherwise toggle completion status
      onClick();
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 group flex flex-col",
        completed ? "opacity-70" : "opacity-100",
      )}
      style={{
        ...cardStyle,
        width: cardSize,
        height: cardSize
      }}
      onClick={handleCardClick}
      role="button"
      aria-pressed={completed}
      tabIndex={0}
    >
      {/* Item actions - only edit button in top right corner */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-2 z-10">
        {/* Left side - Repeat Option Badge - Only show if there is a repeat option */}
        <div className="flex flex-col items-start gap-2">
          {repeatOption && repeatOption !== 'none' && (
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-black/70 text-white px-2 py-0.5",
                "text-xs shadow-sm", 
                "dark:bg-black/80 dark:text-white"
              )}
            >
              {repeatOption}
            </Badge>
          )}
        </div>
        
        {/* Right side - Only Edit button */}
        {!readOnly && (
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "rounded-full shadow-md",
              "bg-white/80 hover:bg-white text-gray-800",
              "w-10 h-10",
              "transition-all duration-200 hover:scale-110",
              "dark:border dark:border-gray-600"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${name}`}
          >
            <Pencil className="h-5 w-5" />
          </Button>
        )}
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
          <div className="rounded-full bg-green-500/80 flex items-center justify-center h-14 w-14">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
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
        <h3 className="text-white font-medium text-shadow truncate pt-4" 
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.2,
              fontSize: '0.85rem'
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
