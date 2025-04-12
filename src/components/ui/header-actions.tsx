
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionItem {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  shortLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  mobile?: 'show' | 'hide' | 'dropdown';
}

interface HeaderActionsProps {
  primaryAction?: ActionItem;
  secondaryActions?: ActionItem[];
  className?: string;
  mobileMenuLabel?: string;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  primaryAction,
  secondaryActions = [],
  className,
  mobileMenuLabel = "More actions"
}) => {
  const { isMobile } = useIsMobile();
  
  // Filter actions based on mobile visibility preference
  const visibleSecondaryActions = secondaryActions.filter(action => 
    action.mobile !== 'hide' || !isMobile
  );
  
  const dropdownActions = isMobile 
    ? secondaryActions.filter(action => action.mobile === 'dropdown' || action.mobile !== 'show')
    : [];
  
  const buttonActions = isMobile
    ? secondaryActions.filter(action => action.mobile === 'show')
    : secondaryActions;
    
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Visible secondary actions */}
      {buttonActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          size={isMobile ? "sm" : "default"}
          onClick={action.onClick}
          disabled={action.disabled}
          className="shadow-sm"
        >
          {action.icon && <action.icon className="h-4 w-4 mr-1" />}
          {isMobile && action.shortLabel ? action.shortLabel : action.label}
        </Button>
      ))}
      
      {/* Primary action button */}
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          size={isMobile ? "sm" : "default"}
          variant={primaryAction.variant || "default"}
          disabled={primaryAction.disabled}
          className={cn(
            "shadow-sm", 
            primaryAction.variant === undefined && "bg-todo-purple hover:bg-todo-purple/90 text-white"
          )}
        >
          {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-1" />}
          {isMobile && primaryAction.shortLabel ? primaryAction.shortLabel : primaryAction.label}
        </Button>
      )}
      
      {/* Dropdown menu for mobile */}
      {isMobile && dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{mobileMenuLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border border-border w-56">
            {dropdownActions.map((action, index) => (
              <DropdownMenuItem 
                key={index} 
                onClick={action.onClick}
                disabled={action.disabled}
                className="cursor-pointer"
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default HeaderActions;
