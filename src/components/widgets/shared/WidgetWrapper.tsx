
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface WidgetWrapperProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  title?: string;
  icon?: React.ReactNode;
  linkTo?: string;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
  children, 
  className, 
  padded = true, 
  title, 
  icon, 
  linkTo
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700",
      padded ? isMobile ? "p-3" : "p-5" : "",
      className
    )}>
      {(title || icon) && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {title && <h3 className="font-medium">{title}</h3>}
          </div>
          {linkTo && (
            <Link to={linkTo} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <span className="mr-1">View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
