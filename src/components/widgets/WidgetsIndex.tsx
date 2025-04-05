
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import components with different import names to avoid initialization issues
import CalendarComp from './CalendarWidget';
import TaskComp from './TaskWidget';
import SpendingComp from './SpendingWidget';
import ScannerComp from './ScannerWidget';
import WeatherComp from './WeatherWidget';

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

// Export the components with their public names
export const CalendarWidget = CalendarComp;
export const TaskWidget = TaskComp;
export const SpendingWidget = SpendingComp;
export const ScannerWidget = ScannerComp;
export const WeatherWidget = WeatherComp;

// Now define the widget components map
export const WidgetComponents = {
  calendar: CalendarComp,
  tasks: TaskComp,
  spending: SpendingComp,
  scanner: ScannerComp,
  weather: WeatherComp
};
