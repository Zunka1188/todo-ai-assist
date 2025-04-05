
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

// First, import all widget components
import CalendarWidgetComponent from './CalendarWidget';
import TaskWidgetComponent from './TaskWidget';
import SpendingWidgetComponent from './SpendingWidget';
import ScannerWidgetComponent from './ScannerWidget';
import WeatherWidgetComponent from './WeatherWidget';

// Then, create renamed constants to avoid initialization issues
const CalendarWidget = CalendarWidgetComponent;
const TaskWidget = TaskWidgetComponent;
const SpendingWidget = SpendingWidgetComponent;
const ScannerWidget = ScannerWidgetComponent;
const WeatherWidget = WeatherWidgetComponent;

// Re-export all the components
export { 
  CalendarWidget, 
  TaskWidget, 
  SpendingWidget, 
  ScannerWidget, 
  WeatherWidget 
};

// Define the widget components map with direct references
export const WidgetComponents = {
  calendar: CalendarWidget,
  tasks: TaskWidget,
  spending: SpendingWidget,
  scanner: ScannerWidget,
  weather: WeatherWidget
};
