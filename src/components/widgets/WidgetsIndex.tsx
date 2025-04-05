
import React from 'react';
import CalendarWidget from './CalendarWidget';
import TaskWidget from './TaskWidget';
import SpendingWidget from './SpendingWidget';
import ScannerWidget from './ScannerWidget';

export { CalendarWidget, TaskWidget, SpendingWidget, ScannerWidget };

// For convenience, also export a components map
export const WidgetComponents = {
  calendar: CalendarWidget,
  tasks: TaskWidget,
  spending: SpendingWidget,
  scanner: ScannerWidget
};

// Add generic widget wrapper for consistent styling
export const WidgetWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border dark:border-gray-700 ${className || ''}`}>
      {children}
    </div>
  );
};
