
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import all widgets directly
import CalendarWidgetComponent from './CalendarWidget';
import TaskWidgetComponent from './TaskWidget';
import SpendingWidgetComponent from './SpendingWidget';
import ScannerWidgetComponent from './ScannerWidget';
import WeatherWidgetComponent from './WeatherWidget';

// Define the WidgetWrapper component
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

// Export renamed components to avoid naming conflicts
export const CalendarWidget = CalendarWidgetComponent;
export const TaskWidget = TaskWidgetComponent;
export const SpendingWidget = SpendingWidgetComponent;
export const ScannerWidget = ScannerWidgetComponent;
export const WeatherWidget = WeatherWidgetComponent;

// Define the widget components map with the imported components
export const WidgetComponents = {
  calendar: CalendarWidgetComponent,
  tasks: TaskWidgetComponent,
  spending: SpendingWidgetComponent,
  scanner: ScannerWidgetComponent,
  weather: WeatherWidgetComponent
};
