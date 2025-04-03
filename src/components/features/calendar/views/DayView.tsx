
import React from 'react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

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

interface DayViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme
}) => {
  const prevDay = () => {
    setDate(subDays(date, 1));
  };
  
  const nextDay = () => {
    setDate(addDays(date, 1));
  };
  
  const getEventsForDay = () => {
    return events.filter(event => 
      isSameDay(event.startDate, date) || 
      isSameDay(event.endDate, date) ||
      (event.startDate <= date && event.endDate >= date)
    );
  };
  
  const dayEvents = getEventsForDay();
  const allDayEvents = dayEvents.filter(event => event.allDay);
  const timeEvents = dayEvents.filter(event => !event.allDay);
  
  // Function to get formatted time from date
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Create hours array for the time column
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const isCurrentDate = isToday(date);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={cn(
          "text-xl font-semibold flex items-center",
          theme === 'light' ? "text-foreground" : "text-white"
        )}>
          {format(date, 'EEEE, MMMM d, yyyy')}
          {isCurrentDate && (
            <span className="ml-2 text-sm px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
              Today
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevDay}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextDay}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-[1fr] bg-muted/30 p-2 border-b">
            <div className="text-sm font-medium">All day events</div>
          </div>
          
          <div className="p-2 space-y-2">
            {allDayEvents.map(event => (
              <div 
                key={event.id}
                className="rounded p-3 cursor-pointer hover:opacity-90 flex items-center"
                style={{ backgroundColor: event.color || '#4285F4' }}
                onClick={() => handleViewEvent(event)}
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{event.title}</div>
                  {event.location && (
                    <div className="text-xs flex items-center text-white/90 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Time-based events section */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[4rem_1fr] bg-muted/30 p-2 border-b">
          <div className="text-sm font-medium">Time</div>
          <div className="text-sm font-medium">Events</div>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {hours.map(hour => {
            const hourDate = new Date(date);
            hourDate.setHours(hour, 0, 0, 0);
            
            const hourEndDate = new Date(date);
            hourEndDate.setHours(hour, 59, 59, 999);
            
            const hourEvents = timeEvents.filter(event => 
              (event.startDate >= hourDate && event.startDate <= hourEndDate) ||
              (event.endDate >= hourDate && event.endDate <= hourEndDate) ||
              (event.startDate <= hourDate && event.endDate >= hourEndDate)
            );
            
            const now = new Date();
            const isCurrentHour = isCurrentDate && now.getHours() === hour;
            
            return (
              <div 
                key={hour} 
                className={cn(
                  "grid grid-cols-[4rem_1fr] border-b min-h-[80px]",
                  isCurrentHour && "bg-accent/20"
                )}
              >
                <div className="p-2 text-sm text-right text-muted-foreground border-r">
                  {format(hourDate, 'h a')}
                </div>
                
                <div className="p-2 space-y-2">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className="rounded p-2 cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: event.color || '#4285F4' }}
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="font-medium text-white">{event.title}</div>
                      <div className="text-xs flex items-center text-white/90 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                      </div>
                      {event.location && (
                        <div className="text-xs flex items-center text-white/90 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
