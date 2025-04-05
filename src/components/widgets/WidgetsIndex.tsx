
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

// Direct imports (most straightforward approach)
import CalendarWidgetDefault from './CalendarWidget';
import TaskWidgetDefault from './TaskWidget';
import SpendingWidgetDefault from './SpendingWidget';
import ScannerWidgetDefault from './ScannerWidget';
import WeatherWidgetDefault from './WeatherWidget';

// Exports with the desired names
export const CalendarWidget = CalendarWidgetDefault;
export const TaskWidget = TaskWidgetDefault;
export const SpendingWidget = SpendingWidgetDefault;
export const ScannerWidget = ScannerWidgetDefault;
export const WeatherWidget = WeatherWidgetDefault;

// Widget components map
export const WidgetComponents = {
  calendar: CalendarWidgetDefault,
  tasks: TaskWidgetDefault,
  spending: SpendingWidgetDefault,
  scanner: ScannerWidgetDefault,
  weather: WeatherWidgetDefault
};
