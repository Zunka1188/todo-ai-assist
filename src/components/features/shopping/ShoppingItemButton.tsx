
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
    <div className="w-full max-w-[320px] h-[96px] bg-background rounded-md overflow-hidden flex flex-col border border-border">
      {/* Top Section: Product Image & Details (64px height) */}
      <div className="flex h-[64px] w-full">
        {/* Left Column - Product Image (48x48px with 8px margin) */}
        <div className="w-[48px] h-[48px] my-auto ml-2">
          {imageUrl ? (
            <div 
              className="w-full h-full rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <div className="w-full h-full rounded-md bg-muted" aria-hidden="true" />
          )}
        </div>
        
        {/* Right Column - Product Details (with 8px gap from image) */}
        <div className="flex flex-col justify-center ml-2 overflow-hidden max-w-[256px]">
          {/* Product Name */}
          <div className="text-base font-bold truncate">
            {name || "Unnamed Product"}
          </div>
          
          {/* Additional Details */}
          {hasAdditionalInfo && (
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
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
                <div className="w-full truncate">
                  {notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Section: Purchase Button (32px height) */}
      <Button
        type="button"
        variant="purchase" 
        size="purchase"
        className={cn(
          "w-full h-[32px] rounded-sm mt-auto",
          "flex items-center justify-center",
          className
        )}
        onClick={onClick}
      >
        {completed ? (
          <>
            <Check size={14} className="mr-2" />
            <span className="font-medium text-sm">Purchased</span>
          </>
        ) : (
          <span className="font-medium text-sm">Purchase</span>
        )}
      </Button>
    </div>
  );
};

export default ShoppingItemButton;
