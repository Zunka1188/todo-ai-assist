
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
  const hasAdditionalInfo = quantity || price || notes || (repeatOption && repeatOption !== 'none');
  
  return (
    <Button
      type="button"
      variant={completed ? "completed" : "active"} // Using semantic variants for better readability
      size="sm"
      className={cn(
        "flex flex-row items-center justify-start gap-3 transition-colors w-full relative",
        "h-auto min-h-[40px] px-3 py-2", // Reduced height by 50% (from 80px to 40px)
        className
      )}
      onClick={onClick}
    >
      {/* Image on the left side */}
      {imageUrl ? (
        <div 
          className="h-[32px] w-[32px] rounded-md bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
      ) : (
        <div className="h-[32px] w-[32px] rounded-md bg-muted shrink-0" aria-hidden="true" />
      )}
      
      {/* Content on the right side */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {completed ? (
          <div className="flex items-center w-full">
            <Check size={16} className="mr-2 shrink-0" />
            <span className="truncate font-medium">{name ? name : "Purchased"}</span>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <span className="truncate font-medium">{name ? name : "Mark as Purchased"}</span>
          </div>
        )}
        
        {/* Display additional details when available */}
        {!completed && hasAdditionalInfo && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 w-full text-xs text-muted-foreground mt-0.5">
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
          </div>
        )}
      </div>
    </Button>
  );
};

export default ShoppingItemButton;
