
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

// Import widget components - DO NOT use these directly in any component maps or exports yet
import * as CalendarWidgetTemp from './CalendarWidget';
import * as TaskWidgetTemp from './TaskWidget';
import * as SpendingWidgetTemp from './SpendingWidget';
import * as ScannerWidgetTemp from './ScannerWidget';
import * as WeatherWidgetTemp from './WeatherWidget';

// Now we can safely reference the default exports
const CalendarWidgetComponent = CalendarWidgetTemp.default;
const TaskWidgetComponent = TaskWidgetTemp.default;
const SpendingWidgetComponent = SpendingWidgetTemp.default;
const ScannerWidgetComponent = ScannerWidgetTemp.default;
const WeatherWidgetComponent = WeatherWidgetTemp.default;

// Export the components with their desired names
export const CalendarWidget = CalendarWidgetComponent;
export const TaskWidget = TaskWidgetComponent;
export const SpendingWidget = SpendingWidgetComponent;
export const ScannerWidget = ScannerWidgetComponent;
export const WeatherWidget = WeatherWidgetComponent;

// Finally, define the widget components map using the assigned component variables
export const WidgetComponents = {
  calendar: CalendarWidgetComponent,
  tasks: TaskWidgetComponent,
  spending: SpendingWidgetComponent,
  scanner: ScannerWidgetComponent,
  weather: WeatherWidgetComponent
};
