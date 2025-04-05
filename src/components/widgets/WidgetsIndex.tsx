
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import all widget components first
import CalendarWidgetComp from './CalendarWidget';
import TaskWidgetComp from './TaskWidget';
import SpendingWidgetComp from './SpendingWidget';
import ScannerWidgetComp from './ScannerWidget';
import WeatherWidgetComp from './WeatherWidget';

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

// Re-export the widgets with their original names
export const CalendarWidget = CalendarWidgetComp;
export const TaskWidget = TaskWidgetComp;
export const SpendingWidget = SpendingWidgetComp;
export const ScannerWidget = ScannerWidgetComp;
export const WeatherWidget = WeatherWidgetComp;

// Define the widget components map using the imported components
export const WidgetComponents = {
  calendar: CalendarWidgetComp,
  tasks: TaskWidgetComp,
  spending: SpendingWidgetComp,
  scanner: ScannerWidgetComp,
  weather: WeatherWidgetComp
};
