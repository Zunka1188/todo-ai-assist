
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

// Import each widget component individually and export it right away
// This ensures that imports are resolved before any references
import CalendarWidgetImpl from './CalendarWidget';
export const CalendarWidget = CalendarWidgetImpl;

import TaskWidgetImpl from './TaskWidget';
export const TaskWidget = TaskWidgetImpl;

import SpendingWidgetImpl from './SpendingWidget';
export const SpendingWidget = SpendingWidgetImpl;

import ScannerWidgetImpl from './ScannerWidget';
export const ScannerWidget = ScannerWidgetImpl;

import WeatherWidgetImpl from './WeatherWidget';
export const WeatherWidget = WeatherWidgetImpl;

// Define the widget components map last, after all components are imported and exported
export const WidgetComponents = {
  calendar: CalendarWidget,
  tasks: TaskWidget,
  spending: SpendingWidget,
  scanner: ScannerWidget,
  weather: WeatherWidget
};
