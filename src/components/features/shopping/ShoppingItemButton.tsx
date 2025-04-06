
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
      "relative",
      isMobile ? "w-full" : "shopping-item-desktop"
    )}>
      <div 
        className={cn(
          "flex flex-col rounded-md overflow-hidden border cursor-pointer",
          isMobile ? "h-32 w-full" : "h-36 w-64", // Increased height from h-28 to h-32 for more space
          completed ? 'bg-gray-100 border-gray-300' : 'bg-card border-border hover:bg-accent transition-colors'
        )}
        onClick={onClick}
      >
        <div className={cn(
          "relative w-full overflow-hidden bg-gray-100",
          isMobile ? "h-24" : "h-24" // Increased height from h-20 to h-24 for mobile
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
                isMobile ? "text-xs px-2 py-1" : "text-xs py-0"
              )}>
                {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
              </Badge>
            </div>
          )}
          
          {!isMobile && onImagePreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImagePreview();
              }}
              className="absolute bottom-0.5 right-0.5 p-0.5 bg-black/30 rounded-full hover:bg-black/50"
            >
              <Maximize2 className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
        
        <div className="p-2 flex-grow"> {/* Increased padding from p-1 to p-2 */}
          <h3 className={cn(
            "font-medium truncate", 
            isMobile ? "text-sm" : "text-xs",
            completed ? 'line-through text-gray-500' : ''
          )}>
            {name}
          </h3>
          {quantity && (
            <p className={cn(
              "truncate mt-0.5",
              isMobile ? "text-xs" : "text-xs",
              completed ? 'text-gray-400' : 'text-gray-500'
            )}>
              {quantity}
            </p>
          )}
          {notes && (
            <p className={cn(
              "truncate mt-0.5",
              isMobile ? "text-xs" : "text-xs",
              completed ? 'text-gray-400' : 'text-gray-500'
            )}>
              {notes}
            </p>
          )}
        </div>
      </div>

      {isMobile && onImagePreview && (
        <div className="absolute top-2 right-2"> {/* Increased top and right from 1 to 2 for better positioning */}
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 opacity-90 rounded-full" {/* Increased from h-7 w-7 to h-8 w-8 */}
            onClick={(e) => {
              e.stopPropagation();
              onImagePreview();
            }}
          >
            <Maximize2 className="h-5 w-5" /> {/* Increased from h-4 w-4 to h-5 w-5 */}
          </Button>
        </div>
      )}
      
      {!isMobile && (
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
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            <Button
              size="icon" 
              variant="secondary"
              className="h-6 w-6 p-0 opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            
            <ShareButton
              size="icon"
              variant="secondary"
              className="h-6 w-6 p-0 opacity-90"
              title={`Shopping item: ${name}`}
              text={`${name}${quantity ? ` - Quantity: ${quantity}` : ''}${notes ? `\n\nNotes: ${notes}` : ''}`}
              fileUrl={imageUrl}
              onClick={(e) => e.stopPropagation()}
              showOptions={true}
            >
              <Share2 className="h-3.5 w-3.5" />
            </ShareButton>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingItemButton;
