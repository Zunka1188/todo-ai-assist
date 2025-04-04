
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
    
    return (
      <Button
        ref={ref}
        variant={variant}
        onClick={onClick}
        className={cn(
          "w-auto max-w-[200px] h-auto min-h-[40px] px-3 py-2", // Reduced height by 50% (from 80px to 40px)
          "flex flex-row items-center justify-start gap-3 transition-all duration-200",
          "rounded-lg overflow-hidden relative",
          active && "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
        {...props}
        aria-label={`${text} options`}
      >
        {/* Image on the left side */}
        {imageUrl ? (
          <div 
            className="h-[32px] w-[32px] rounded-md bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          />
        ) : (
          <div className="h-[32px] w-[32px] rounded-md bg-muted/40 shrink-0" aria-hidden="true" />
        )}
        
        {/* Content on the right side */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex w-full items-center justify-between">
            <span className="truncate text-base font-medium mr-1">
              {text}
            </span>
            {!hideIcon && (
              <div 
                onClick={handleIconClick}
                className={cn(
                  "flex items-center justify-center ml-2 rounded-full",
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

          {/* Display additional details when available */}
          {hasDetails && (
            <div className="flex flex-wrap gap-x-2 gap-y-1 w-full text-xs text-muted-foreground">
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
            </div>
          )}
          
          {notes && (
            <div className="w-full text-xs text-muted-foreground truncate">
              {notes}
            </div>
          )}
        </div>
      </Button>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton };
