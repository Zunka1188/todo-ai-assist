
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ShoppingItemButtonProps {
  name: string;
  quantity?: string;
  completed?: boolean;
  repeatOption?: string;
  imageUrl?: string;
  notes?: string;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onImagePreview?: () => void;
  readOnly?: boolean;
}

const ShoppingItemButton: React.FC<ShoppingItemButtonProps> = ({
  name,
  quantity = '',
  completed = false,
  repeatOption = 'none',
  imageUrl,
  notes,
  onClick,
  onDelete,
  onEdit,
  onImagePreview,
  readOnly = false
}) => {
  const { isMobile } = useIsMobile();
  
  const getBadgeColorClass = () => {
    switch (repeatOption) {
      case 'weekly':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'monthly':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const getInitial = () => {
    return name.charAt(0).toUpperCase();
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[DEBUG] ShoppingItemButton - Item clicked:", name, "Completed:", completed);
    onClick();
  };

  // Fixed dimensions for items
  const itemHeight = isMobile ? "h-24" : "h-36";
  const imageHeight = isMobile ? "h-16" : "h-24";
  
  return (
    <div className="relative w-full">
      <div 
        className={cn(
          "flex flex-col rounded-md overflow-hidden border cursor-pointer",
          itemHeight,
          completed ? 'bg-gray-100 border-gray-300' : 'bg-card border-border hover:bg-accent transition-colors'
        )}
        onClick={handleItemClick}
        role="button"
        aria-pressed={completed}
        style={{ width: '100%' }} // Ensure full width
      >
        <div className={cn(
          "relative w-full overflow-hidden bg-gray-100",
          imageHeight
        )}>
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={name}
                className={cn(
                  "w-full h-full object-cover",
                  completed ? 'opacity-50' : ''
                )}
              />
            </>
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center",
              completed ? 'bg-gray-200' : 'bg-gray-200',
              "font-bold"
            )}>
              <span className="text-xl">{getInitial()}</span>
            </div>
          )}
          
          {repeatOption !== 'none' && (
            <div className="absolute bottom-1 left-1">
              <Badge className={cn(
                getBadgeColorClass(),
                isMobile ? "text-[10px] px-1 py-0" : "text-xs py-0"
              )}>
                {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
              </Badge>
            </div>
          )}
          
          {imageUrl && !isMobile && onImagePreview && (
            <div className="absolute bottom-1 right-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-5 w-5 p-0 opacity-90 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImagePreview) onImagePreview();
                }}
                type="button"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {readOnly && (
            <div className="absolute top-1 right-1">
              <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-gray-500 text-white">
                Read-only
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-1 flex-grow overflow-hidden">
          <h3 className={cn(
            "font-medium truncate", 
            isMobile ? "text-[11px]" : "text-xs",
            completed ? 'line-through text-gray-500' : ''
          )}>
            {name}
          </h3>
          {quantity && (
            <p className={cn(
              "truncate mt-0.5",
              isMobile ? "text-[10px]" : "text-xs",
              completed ? 'text-gray-400' : 'text-gray-500'
            )}>
              {quantity}
            </p>
          )}
          {notes && !isMobile && (
            <p className={cn(
              "truncate mt-0.5",
              "text-xs",
              completed ? 'text-gray-400' : 'text-gray-500'
            )}>
              {notes}
            </p>
          )}
        </div>
      </div>

      {isMobile && imageUrl && (
        <div className="absolute top-1 right-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-5 w-5 p-0 bg-gray-600 hover:bg-gray-700 text-white opacity-85 rounded-full shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onImagePreview) onImagePreview();
            }}
            type="button"
            aria-label="Expand item"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {!isMobile && !readOnly && (
        <>
          <div className="absolute top-1.5 right-1.5">
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 p-0 opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="absolute top-1.5 left-1.5">
            <Button
              size="icon" 
              variant="secondary"
              className="h-6 w-6 p-0 opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              type="button"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingItemButton;
