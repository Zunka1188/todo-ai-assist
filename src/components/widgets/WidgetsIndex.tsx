
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import the widgets directly without renaming
import CalendarWidgetOriginal from './CalendarWidget';
import TaskWidgetOriginal from './TaskWidget';
import SpendingWidgetOriginal from './SpendingWidget';
import ScannerWidgetOriginal from './ScannerWidget';
import WeatherWidgetOriginal from './WeatherWidget';

// Define the WidgetWrapper component first
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

// Separate the exports and imports to avoid any circular reference issues
export const CalendarWidget = CalendarWidgetOriginal;
export const TaskWidget = TaskWidgetOriginal;
export const SpendingWidget = SpendingWidgetOriginal;
export const ScannerWidget = ScannerWidgetOriginal;
export const WeatherWidget = WeatherWidgetOriginal;

// Define the widget components map separately using the original imports
// to avoid any reference to identifiers that haven't been initialized
export const WidgetComponents = {
  calendar: CalendarWidgetOriginal,
  tasks: TaskWidgetOriginal,
  spending: SpendingWidgetOriginal,
  scanner: ScannerWidgetOriginal,
  weather: WeatherWidgetOriginal
};
