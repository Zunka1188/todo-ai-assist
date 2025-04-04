
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Repeat } from 'lucide-react';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  quantity?: string;
  price?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  name?: string;
  imageUrl?: string;
}

const ShoppingItemButton = ({ 
  completed, 
  onClick, 
  className,
  quantity,
  price,
  notes,
  repeatOption,
  name,
  imageUrl
}: ShoppingItemButtonProps) => {
  // Determine if we need to show additional info
  const hasAdditionalInfo = quantity || price || notes || (repeatOption && repeatOption !== 'none') || imageUrl;
  
  return (
    <Button
      type="button"
      variant={completed ? "completed" : "active"} // Using semantic variants for better readability
      size="sm"
      className={cn(
        "flex flex-col items-start justify-center gap-1 transition-colors w-full",
        "h-auto min-h-[80px]", // Set a consistent minimum height for all buttons
        className
      )}
      onClick={onClick}
    >
      {completed ? (
        <div className="flex items-center w-full">
          <Check size={16} className="mr-2" />
          <span className="truncate font-medium">{name ? name : "Purchased"}</span>
        </div>
      ) : (
        <div className="flex items-center w-full">
          <span className="truncate font-medium">{name ? name : "Mark as Purchased"}</span>
        </div>
      )}
      
      {/* Display additional details when available */}
      {!completed && hasAdditionalInfo && (
        <div className="flex flex-wrap gap-x-2 gap-y-1 w-full text-xs text-muted-foreground mt-1">
          {quantity && (
            <span className="inline-flex items-center">
              Qty: {quantity}
            </span>
          )}
          {price && (
            <span className="inline-flex items-center">
              ${price}
            </span>
          )}
          {repeatOption && repeatOption !== 'none' && (
            <span className="inline-flex items-center">
              <Repeat size={10} className="mr-1" />
              {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
            </span>
          )}
          {notes && (
            <div className="w-full text-xs truncate mt-0.5">
              {notes}
            </div>
          )}
          {imageUrl && (
            <div className="w-full mt-2 h-[48px] overflow-hidden">
              <img 
                src={imageUrl} 
                alt={name || "Product"} 
                className="rounded-md object-cover h-full max-w-[30%]"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </Button>
  );
};

export default ShoppingItemButton;
