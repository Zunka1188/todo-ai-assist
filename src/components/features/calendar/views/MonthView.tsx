
import React from 'react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
  };
  reminder?: string;
}

interface MonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1,  // Default to Monday
  minCellHeight = 100 // Default value if not provided
}) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate what day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  // Adjust for the weekStartsOn setting
  let dayOfWeek = monthStart.getDay();
  // Convert from Sunday-based (0-6) to custom week start (e.g., Monday-based)
  dayOfWeek = ((dayOfWeek - weekStartsOn) + 7) % 7;
  
  // Calculate days from the previous month to display
  const leadingDays = Array.from({ length: dayOfWeek }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (dayOfWeek - i));
    return d;
  });
  
  // Calculate days from the next month to display
  const trailingDaysCount = 42 - (leadingDays.length + daysInMonth.length);
  const trailingDays = Array.from({ length: trailingDaysCount }, (_, i) => {
    const d = new Date(monthEnd);
    d.setDate(d.getDate() + (i + 1));
    return d;
  });
  
  const allDays = [...leadingDays, ...daysInMonth, ...trailingDays];
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  
  const prevMonth = () => {
    setDate(subMonths(date, 1));
  };
  
  const nextMonth = () => {
    setDate(addMonths(date, 1));
  };
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(event.startDate, day) || 
      isSameDay(event.endDate, day) ||
      (event.startDate <= day && event.endDate >= day)
    );
  };
  
  // Function to get formatted time from date
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reorder the days of week to start with Monday
  const daysOfWeek = weekStartsOn === 1 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white"
        )}>
          {format(date, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 text-center">
          {daysOfWeek.map(day => (
            <div 
              key={day} 
              className="py-2 font-medium text-sm border-b"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 overflow-hidden">
          {weeks.flat().map((day, i) => {
            const isCurrentMonth = isSameMonth(day, date);
            const isSelectedDate = isSameDay(day, date);
            const isCurrentDate = isToday(day);
            const dayEvents = getEventsForDay(day);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "min-h-[100px] p-1 border",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isCurrentDate && "bg-accent/30",
                  isSelectedDate && "bg-primary/10"
                )}
                style={{minHeight: `${minCellHeight}px`}}
                onClick={() => setDate(day)}
                role="button"
                aria-pressed={isSelectedDate}
                aria-label={`${format(day, 'PPPP')}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className={cn(
                      "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                      isCurrentDate && "bg-primary text-primary-foreground",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map(event => (
                    <div 
                      key={event.id}
                      className="px-1 py-0.5 rounded text-xs truncate cursor-pointer hover:bg-opacity-90 transition shadow-sm border-l-4"
                      style={{
                        backgroundColor: event.color ? `${event.color}20` : '#4285F420', // Lighter background
                        color: event.color || '#4285F4',
                        borderLeftColor: event.color || '#4285F4'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                      title={event.title}
                      role="button"
                      aria-label={`Event: ${event.title}`}
                    >
                      {event.allDay ? (
                        <span className="font-medium">{event.title}</span>
                      ) : (
                        <span>{getFormattedTime(event.startDate)} - {event.title}</span>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground pt-1 bg-muted/20 rounded">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
