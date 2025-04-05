
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import AppHeader from '@/components/layout/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TaskWidget from '@/components/widgets/TaskWidget';

interface WidgetGridProps {
  className?: string;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ className }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      <AppHeader 
        title="Widgets" 
        subtitle="Quick access to your information"
        className={cn(
          "font-semibold section-header",
          theme === 'light' ? "text-primary" : "text-white"
        )}
      />
      
      <div className={cn(
        "grid gap-3 sm:gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        <div className="h-full">
          <CalendarWidget />
        </div>
        <div className="h-full">
          <TaskWidget />
        </div>
      </div>
    </div>
  );
};

export default WidgetGrid;
