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
  
  const cardStyle = imageUrl 
    ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } 
    : { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' };
  
  const cardHeight = isMobile ? '70px' : '180px';

  const handleCardClick = (e: React.MouseEvent) => {
    if (onImagePreview && e.target === e.currentTarget) {
      onImagePreview();
    }
  };

  const handleRepeatBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={cn(
        "relative w-full overflow-hidden transition-all duration-200 group",
        completed ? "opacity-70" : "opacity-100"
      )}
      style={{
        ...cardStyle,
        height: cardHeight,
        marginBottom: isMobile ? '1px' : undefined
      }}
      onClick={handleCardClick}
      role="button"
      aria-pressed={completed}
      tabIndex={0}
    >
      <div className="absolute top-1 left-1 z-10">
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "rounded-full bg-white/70 hover:bg-white shadow-md",
            isMobile ? "h-5 w-5" : "h-8 w-8"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={readOnly}
          aria-label={`Edit ${name}`}
        >
          <Pencil className={cn(isMobile ? "h-2.5 w-2.5" : "h-4 w-4", "text-gray-700")} />
        </Button>
      </div>
      
      <div className="absolute top-1 right-1 z-10">
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "rounded-full bg-white/70 hover:bg-white shadow-md",
            isMobile ? "h-5 w-5" : "h-8 w-8"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={readOnly}
          aria-label={`Delete ${name}`}
        >
          <Trash2 className={cn(isMobile ? "h-2.5 w-2.5" : "h-4 w-4", "text-gray-700")} />
        </Button>
      </div>

      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {completed && (
          <div className={cn(
            "rounded-full bg-green-500/80 flex items-center justify-center",
            isMobile ? "h-8 w-8" : "h-16 w-16"
          )}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={isMobile ? "16" : "32"} 
              height={isMobile ? "16" : "32"} 
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
      
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className={cn(
          "text-white font-medium text-shadow truncate",
          isMobile ? "text-xs" : ""
        )} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {name}
        </h3>
        <div className="flex items-center gap-1">
          {quantity && (
            <span className={cn(
              "text-white/90 text-shadow",
              isMobile ? "text-[8px]" : "text-xs"
            )} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {quantity}
            </span>
          )}
        </div>
      </div>
      
      {repeatOption && repeatOption !== 'none' && (
        <Badge 
          variant="secondary" 
          className={cn(
            "absolute bottom-1 right-1 bg-white/80 text-black cursor-default",
            isMobile ? "text-[8px] px-1 py-0" : "text-xs"
          )}
          onClick={handleRepeatBadgeClick}
        >
          {repeatOption}
        </Badge>
      )}
    </Card>
  );
};

export default ShoppingItemCard;
