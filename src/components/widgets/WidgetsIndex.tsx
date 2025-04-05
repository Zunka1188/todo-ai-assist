
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

// Import all components first
import * as CalendarWidget from './CalendarWidget';
import * as TaskWidget from './TaskWidget';
import * as SpendingWidget from './SpendingWidget';
import * as ScannerWidget from './ScannerWidget';
import * as WeatherWidget from './WeatherWidget';

// Then export them
export { default as CalendarWidget } from './CalendarWidget';
export { default as TaskWidget } from './TaskWidget';
export { default as SpendingWidget } from './SpendingWidget';
export { default as ScannerWidget } from './ScannerWidget';
export { default as WeatherWidget } from './WeatherWidget';

// Define the widget components map using the imported modules' default exports
export const WidgetComponents = {
  calendar: CalendarWidget.default,
  tasks: TaskWidget.default,
  spending: SpendingWidget.default,
  scanner: ScannerWidget.default,
  weather: WeatherWidget.default
};
