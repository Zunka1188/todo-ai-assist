
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import the widget components directly 
import CalendarWidgetImpl from './CalendarWidget';
import TaskWidgetImpl from './TaskWidget';
import SpendingWidgetImpl from './SpendingWidget';
import ScannerWidgetImpl from './ScannerWidget';
import WeatherWidgetImpl from './WeatherWidget';

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

// Define widget components directly using the imported implementations
export const CalendarWidget = CalendarWidgetImpl;
export const TaskWidget = TaskWidgetImpl;
export const SpendingWidget = SpendingWidgetImpl;
export const ScannerWidget = ScannerWidgetImpl;
export const WeatherWidget = WeatherWidgetImpl;

// Use the imported implementations directly in the widget components map
export const WidgetComponents = {
  calendar: CalendarWidgetImpl,
  tasks: TaskWidgetImpl,
  spending: SpendingWidgetImpl,
  scanner: ScannerWidgetImpl,
  weather: WeatherWidgetImpl
};
