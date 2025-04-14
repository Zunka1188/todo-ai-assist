
/**
 * Calendar date utility functions
 * This file contains helper functions for date manipulation and formatting
 * specific to the calendar components.
 * 
 * @module dateUtils
 */

import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addDays,
  addWeeks,
  subWeeks,
  subDays,
  addMonths,
  subMonths,
  isWeekend
} from 'date-fns';

/**
 * Get an array of dates for a month grid view, including dates from previous/next months
 * to fill the grid
 * 
 * @param date - The reference date for the month
 * @param weekStartsOn - The day of the week to start on (0 = Sunday, 1 = Monday, etc.)
 * @returns Array of dates for the month grid
 */
export function getCalendarDays(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Get an array of dates for a week view
 * 
 * @param date - The reference date for the week
 * @param weekStartsOn - The day of the week to start on (0 = Sunday, 1 = Monday, etc.)
 * @returns Array of dates for the week
 */
export function getWeekDays(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Format a date for display in the calendar
 * 
 * @param date - The date to format
 * @param formatStr - The date-fns format string to use
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

/**
 * Check if a date is in the current month
 * 
 * @param date - The date to check
 * @param currentMonth - The reference date for the current month
 * @returns True if the date is in the current month
 */
export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
  return isSameMonth(date, currentMonth);
}

/**
 * Check if a date is today
 * 
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Generate hours for the day view
 * 
 * @param startHour - Starting hour (0-23)
 * @param endHour - Ending hour (0-23)
 * @returns Array of hours
 */
export function generateHours(startHour: number = 0, endHour: number = 23): number[] {
  const hours = [];
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i);
  }
  return hours;
}

/**
 * Get the height in pixels for a given duration in minutes
 * 
 * @param minutes - Duration in minutes
 * @param hourHeight - Height of one hour in pixels
 * @returns Height in pixels
 */
export function getHeightForDuration(minutes: number, hourHeight: number = 60): number {
  return (minutes / 60) * hourHeight;
}

/**
 * Get the top position in pixels for a time
 * 
 * @param date - Date with the time to position
 * @param startHour - Starting hour of the view
 * @param hourHeight - Height of one hour in pixels
 * @returns Top position in pixels
 */
export function getTopPositionForTime(date: Date, startHour: number = 0, hourHeight: number = 60): number {
  const hours = date.getHours() - startHour;
  const minutes = date.getMinutes();
  return (hours * 60 + minutes) * (hourHeight / 60);
}

/**
 * Get a formatted time range string
 * 
 * @param startDate - Start date and time
 * @param endDate - End date and time
 * @param formatStr - The date-fns format string to use for time
 * @returns Formatted time range string
 */
export function getFormattedTimeRange(
  startDate: Date, 
  endDate: Date, 
  formatStr: string = 'h:mm a'
): string {
  return `${format(startDate, formatStr)} - ${format(endDate, formatStr)}`;
}
