
import { format, isSameDay } from "date-fns";
import { Event } from '../types/event';
import { reminderOptions } from '../types/form';

export const getFormattedTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getReminderLabel = (value: string): string => {
  const option = reminderOptions.find(opt => opt.value === value);
  return option ? option.label : "No reminder";
};

export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const isDayWithEvents = (day: Date, events: Event[]): boolean => {
  return events.some(event => 
    isSameDay(event.startDate, day) || 
    isSameDay(event.endDate, day) ||
    (event.startDate <= day && event.endDate >= day)
  );
};

export const getEventsForDay = (day: Date, events: Event[]): Event[] => {
  return events.filter(event => 
    isSameDay(event.startDate, day) || 
    isSameDay(event.endDate, day) ||
    (event.startDate <= day && event.endDate >= day)
  );
};
