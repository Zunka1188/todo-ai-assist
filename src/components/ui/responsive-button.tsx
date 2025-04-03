
import React from 'react';
import { EllipsisVertical } from 'lucide-react';
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
    ...props 
  }, ref) => {
    
    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent button click when clicking the icon
      if (onIconClick) {
        onIconClick(e);
      }
    };
    
    return (
      <Button
        ref={ref}
        variant={variant}
        onClick={onClick}
        className={cn(
          "w-auto max-w-[200px] h-[44px] px-4 flex items-center justify-between gap-2 transition-all duration-200",
          "rounded-lg overflow-hidden relative",
          active && "bg-primary text-primary-foreground hover:bg-primary/90", 
          className
        )}
        {...props}
        aria-label={`${text} options`}
      >
        <span className="truncate text-base font-medium mr-1">
          {text}
        </span>
        <div 
          onClick={handleIconClick}
          className={cn(
            "flex items-center justify-center ml-2 rounded-full",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "transition-colors p-0.5 cursor-pointer",
            iconClassName
          )}
          aria-label="More options"
          role="button"
          tabIndex={0}
        >
          <EllipsisVertical size={iconSize} />
        </div>
      </Button>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton };
