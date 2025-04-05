
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

// Import all widget components first, with unique variable names
import * as CalendarWidgetImport from './CalendarWidget';
import * as TaskWidgetImport from './TaskWidget';
import * as SpendingWidgetImport from './SpendingWidget';
import * as ScannerWidgetImport from './ScannerWidget';
import * as WeatherWidgetImport from './WeatherWidget';

// Export the components with their original names
export const CalendarWidget = CalendarWidgetImport.default;
export const TaskWidget = TaskWidgetImport.default;
export const SpendingWidget = SpendingWidgetImport.default;
export const ScannerWidget = ScannerWidgetImport.default;
export const WeatherWidget = WeatherWidgetImport.default;

// Create the widget components map after imports are complete
export const WidgetComponents = {
  calendar: CalendarWidgetImport.default,
  tasks: TaskWidgetImport.default,
  spending: SpendingWidgetImport.default, // Fixed the typo here: was SpendWidgetImport
  scanner: ScannerWidgetImport.default,
  weather: WeatherWidgetImport.default
};
