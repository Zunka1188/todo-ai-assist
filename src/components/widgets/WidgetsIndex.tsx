
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// First define the WidgetWrapper component
export const WidgetWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}> = ({ children, className, padded = true }) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700",
      padded ? isMobile ? "p-3" : "p-5" : "",
      className
    )}>
      {children}
    </div>
  );
};

// Import all widget components separately using explicit imports
import CalendarWidget from './CalendarWidget';
import TaskWidget from './TaskWidget';
import SpendingWidget from './SpendingWidget';
import ScannerWidget from './ScannerWidget';
import WeatherWidget from './WeatherWidget';

// Re-export all the components
export { CalendarWidget, TaskWidget, SpendingWidget, ScannerWidget, WeatherWidget };

// Define the widget components map with direct references
export const WidgetComponents = {
  calendar: CalendarWidget,
  tasks: TaskWidget,
  spending: SpendingWidget,
  scanner: ScannerWidget,
  weather: WeatherWidget
};
