
import React from 'react';

// Import WidgetWrapper from shared file instead of defining it here
import { WidgetWrapper } from './shared/WidgetWrapper';

// Re-export WidgetWrapper
export { WidgetWrapper };

// Import widget components directly
import CalendarWidgetImpl from './CalendarWidget';
import TaskWidgetImpl from './TaskWidget';
import ScannerWidgetImpl from './ScannerWidget';
import WeatherWidgetImpl from './WeatherWidget';

// Create specific exports for each widget
export const CalendarWidget = CalendarWidgetImpl;
export const TaskWidget = TaskWidgetImpl;
export const ScannerWidget = ScannerWidgetImpl;
export const WeatherWidget = WeatherWidgetImpl;

// Define the widget components map using the imported implementations directly
export const WidgetComponents = {
  calendar: CalendarWidgetImpl,
  tasks: TaskWidgetImpl,
  scanner: ScannerWidgetImpl,
  weather: WeatherWidgetImpl
};
