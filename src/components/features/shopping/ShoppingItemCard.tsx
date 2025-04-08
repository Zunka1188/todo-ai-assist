
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
  
  // Background style based on image or default color
  const cardStyle = imageUrl 
    ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } 
    : { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0' };
  
  // Card dimensions
  const cardHeight = isMobile ? '140px' : '180px';
  
  return (
    <Card 
      className={cn(
        "relative w-full h-full overflow-hidden transition-all duration-200 group",
        completed ? "opacity-70" : "opacity-100"
      )}
      style={{
        ...cardStyle,
        height: cardHeight
      }}
      onClick={onImagePreview}
      role="button"
      aria-pressed={completed}
      tabIndex={0}
    >
      {/* Action buttons at corners */}
      <div className="absolute top-2 left-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/70 hover:bg-white shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={readOnly}
          aria-label={`Edit ${name}`}
        >
          <Pencil className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
      
      <div className="absolute top-2 right-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/70 hover:bg-white shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={readOnly}
          aria-label={`Delete ${name}`}
        >
          <Trash2 className="h-4 w-4 text-gray-700" />
        </Button>
      </div>

      {/* Status indicator */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {completed && (
          <div className="h-16 w-16 rounded-full bg-green-500/80 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Item name with text shadow for better readability */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className="text-white font-medium text-shadow truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {name}
        </h3>
        <div className="flex items-center gap-1">
          {quantity && (
            <span className="text-xs text-white/90 text-shadow" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {quantity}
            </span>
          )}
        </div>
      </div>
      
      {/* Repeat badge */}
      {repeatOption && repeatOption !== 'none' && (
        <Badge 
          variant="secondary" 
          className="absolute bottom-2 right-2 bg-white/80 text-black text-xs"
        >
          {repeatOption}
        </Badge>
      )}
    </Card>
  );
};

export default ShoppingItemCard;
