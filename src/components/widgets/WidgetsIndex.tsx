
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Define and export the WidgetWrapper component first
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

// Import widget components directly
import CalendarWidgetImpl from './CalendarWidget';
import TaskWidgetImpl from './TaskWidget';
import SpendingWidgetImpl from './SpendingWidget';
import ScannerWidgetImpl from './ScannerWidget';
import WeatherWidgetImpl from './WeatherWidget';

// Create specific exports for each widget
export const CalendarWidget = CalendarWidgetImpl;
export const TaskWidget = TaskWidgetImpl;
export const SpendingWidget = SpendingWidgetImpl;
export const ScannerWidget = ScannerWidgetImpl;
export const WeatherWidget = WeatherWidgetImpl;

// Define the widget components map using the imported implementations directly
export const WidgetComponents = {
  calendar: CalendarWidgetImpl,
  tasks: TaskWidgetImpl,
  spending: SpendingWidgetImpl,
  scanner: ScannerWidgetImpl,
  weather: WeatherWidgetImpl
};
