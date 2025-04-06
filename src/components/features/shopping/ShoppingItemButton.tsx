
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Maximize2, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ShareButton from '@/components/features/shared/ShareButton';
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
}) => {
  const { isMobile } = useIsMobile();
  
  // Get appropriate badge color based on repeat option
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
  
  // For text items that don't have an image
  const getInitial = () => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={cn(
      "relative h-full",
      isMobile ? "" : "shopping-item-desktop"
    )}>
      <div 
        className={`
          flex flex-col h-full rounded-md overflow-hidden border cursor-pointer
          ${completed ? 'bg-gray-100 border-gray-300' : 'bg-card border-border hover:bg-accent transition-colors'}
        `}
        onClick={onClick}
      >
        <div className={cn(
          "relative w-full overflow-hidden bg-gray-100",
          isMobile ? "pt-[100%]" : "pt-[70%]" // Reduced height ratio for desktop
        )}>
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={name}
                className={`
                  absolute top-0 left-0 w-full h-full object-cover
                  ${completed ? 'opacity-50' : ''}
                `}
              />
              {onImagePreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImagePreview();
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/30 rounded-full hover:bg-black/50"
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </button>
              )}
            </>
          ) : (
            <div className={`
              absolute top-0 left-0 w-full h-full flex items-center justify-center
              ${completed ? 'bg-gray-200' : 'bg-gray-200'}
              font-bold text-3xl
            `}>
              {getInitial()}
            </div>
          )}
          
          {/* Badge for repeat option */}
          {repeatOption !== 'none' && (
            <div className="absolute bottom-2 left-2">
              <Badge className={getBadgeColorClass()}>
                {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-1 flex-grow">
          <h3 className={`text-xs font-medium truncate ${completed ? 'line-through text-gray-500' : ''}`}>
            {name}
          </h3>
          {quantity && (
            <p className={`text-xs mt-0.5 truncate ${completed ? 'text-gray-400' : 'text-gray-500'}`}>
              {quantity}
            </p>
          )}
          {notes && (
            <p className={`text-xs mt-0.5 truncate ${completed ? 'text-gray-400' : 'text-gray-500'}`}>
              {notes}
            </p>
          )}
        </div>
      </div>

      <div className={cn(
        "flex gap-0.5",
        isMobile 
          ? "absolute top-1 left-1" 
          : "absolute top-2 right-2" // Position like in DocumentListItem for desktop
      )}>
        <Button
          size="sm"
          variant="destructive"
          className={cn(
            "opacity-90",
            isMobile ? "h-4 w-4 p-0" : "h-8 w-8"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className={cn(
            isMobile ? "h-2.5 w-2.5" : "h-4 w-4"
          )} />
        </Button>
        
        <Button
          size="sm" 
          variant="secondary"
          className={cn(
            "opacity-90",
            isMobile ? "h-4 w-4 p-0" : "h-8 w-8"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className={cn(
            isMobile ? "h-2.5 w-2.5" : "h-4 w-4"
          )} />
        </Button>
        
        <ShareButton
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
          className={cn(
            "opacity-90",
            isMobile ? "h-4 w-4 p-0" : "h-8 w-8"
          )}
          title={`Shopping item: ${name}`}
          text={`${name}${quantity ? ` - Quantity: ${quantity}` : ''}${notes ? `\n\nNotes: ${notes}` : ''}`}
          fileUrl={imageUrl}
          onClick={(e) => e.stopPropagation()}
          showOptions={true}
        >
          <Share2 className={cn(
            isMobile ? "h-2.5 w-2.5" : "h-4 w-4"
          )} />
        </ShareButton>
      </div>
    </div>
  );
};

export default ShoppingItemButton;
