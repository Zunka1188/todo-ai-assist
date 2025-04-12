
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  centered?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  centered = true
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div 
      className={cn(
        "flex flex-col p-6 rounded-lg border border-dashed border-border",
        centered ? "items-center justify-center text-center" : "",
        className
      )}
    >
      <div className="rounded-full bg-muted p-6 w-[72px] h-[72px] flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, { 
          className: cn("h-8 w-8 text-muted-foreground", 
            (icon as React.ReactElement)?.props?.className
          )
        })}
      </div>
      
      <h3 className={cn(
        "font-medium",
        isMobile ? "text-lg" : "text-xl",
        "mb-2"
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-muted-foreground mb-4",
        isMobile ? "text-sm" : "text-base"
      )}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <div className={cn("flex", centered ? "justify-center" : "", "gap-3")}>
          <Button 
            onClick={onAction} 
            className="bg-todo-purple hover:bg-todo-purple/90 text-white"
          >
            {actionLabel}
          </Button>
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline" 
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
