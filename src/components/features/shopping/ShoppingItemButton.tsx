
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  quantity?: string;
  price?: string;
  notes?: string;
  dateToPurchase?: string;
}

const ShoppingItemButton = ({ 
  completed, 
  onClick, 
  className,
  quantity,
  price,
  notes,
  dateToPurchase
}: ShoppingItemButtonProps) => {
  // Determine if we need to show additional info
  const hasAdditionalInfo = quantity || price || notes || dateToPurchase;
  
  return (
    <Button
      type="button"
      variant={completed ? "completed" : "active"} // Using semantic variants for better readability
      size="sm"
      className={cn(
        "flex flex-col items-start justify-center gap-1 transition-colors w-full",
        hasAdditionalInfo && "py-3", // Add more padding when we have additional info
        className
      )}
      onClick={onClick}
    >
      {completed ? (
        <div className="flex items-center w-full">
          <Check size={16} className="mr-2" />
          <span>Purchased</span>
        </div>
      ) : (
        <div className="flex items-center w-full">
          <span>Mark as Purchased</span>
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
          {dateToPurchase && (
            <span className="inline-flex items-center">
              By: {new Date(dateToPurchase).toLocaleDateString()}
            </span>
          )}
          {notes && (
            <div className="w-full text-xs truncate mt-0.5">
              {notes}
            </div>
          )}
        </div>
      )}
    </Button>
  );
};

export default ShoppingItemButton;
