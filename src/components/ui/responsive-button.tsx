
import React from 'react';
import { EllipsisVertical, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ResponsiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  onClick?: () => void;
  onIconClick?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  iconSize?: number;
  className?: string;
  iconClassName?: string;
  active?: boolean;
  hideIcon?: boolean;
  // Properties for shopping items
  quantity?: string;
  price?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string;
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ 
    text, 
    onClick, 
    onIconClick, 
    variant = 'default', 
    iconSize = 20, 
    className = '', 
    iconClassName = '',
    active = false,
    hideIcon = false,
    quantity,
    price,
    notes,
    repeatOption,
    imageUrl,
    ...props 
  }, ref) => {
    
    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent button click when clicking the icon
      if (onIconClick) {
        onIconClick(e);
      }
    };

    // Determine if we have details to show
    const hasDetails = quantity || price || notes || (repeatOption && repeatOption !== 'none');
    
    // Using the exact grocery item widget style per specifications
    return (
      <div className={cn(
        "w-full max-w-[320px] h-[96px] bg-background rounded-md overflow-hidden flex flex-col",
        "border-2 border-border shadow-md",
        active && "border-primary",
        className
      )}>
        {/* Top Section: Product Image & Details (64px height) */}
        <div className="flex h-[64px] w-full">
          {/* Left Column - Product Image (48x48px with 8px margin) */}
          <div className="w-[48px] h-[48px] my-auto ml-2 flex-shrink-0">
            {imageUrl ? (
              <div 
                className="w-full h-full rounded-md bg-cover bg-center border border-muted"
                style={{ backgroundImage: `url(${imageUrl})` }}
                aria-hidden="true"
              />
            ) : (
              <div className="w-full h-full rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center" aria-hidden="true">
                <span className="text-xs text-muted-foreground">No img</span>
              </div>
            )}
          </div>
          
          {/* Right Column - Product Details (with 8px gap from image) */}
          <div className="flex flex-col justify-center ml-2 flex-1 overflow-hidden pr-2 max-w-[256px]">
            <div className="flex w-full items-center justify-between">
              <span className="text-base font-bold truncate mr-1">
                {text}
              </span>
              
              {!hideIcon && (
                <div 
                  onClick={handleIconClick}
                  className={cn(
                    "flex items-center justify-center ml-auto rounded-full",
                    "hover:bg-black/10 dark:hover:bg-white/20",
                    "transition-colors p-0.5 cursor-pointer shrink-0",
                    iconClassName
                  )}
                  aria-label="More options"
                  role="button"
                  tabIndex={0}
                >
                  <EllipsisVertical 
                    size={iconSize} 
                    className="text-current dark:text-primary-foreground" 
                  />
                </div>
              )}
            </div>

            {/* Additional Details */}
            {hasDetails && (
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
                  <div className="w-full text-xs text-muted-foreground truncate">
                    {notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section: Button (32px height) - Guaranteed to be attached to the bottom */}
        <Button
          ref={ref}
          variant={variant === 'default' ? 'purchase' : variant}
          onClick={onClick}
          className="w-full h-[32px] rounded-none mt-auto border-t border-border absolute bottom-0 left-0 right-0"
          {...props}
        >
          {props.children || "Action"}
        </Button>
      </div>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton };
