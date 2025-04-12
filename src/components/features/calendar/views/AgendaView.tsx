import React from 'react';
import { Event } from '../types/event';
import { format, isSameDay, isToday, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFormattedTime } from '../utils/dateUtils';

interface AgendaViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  itemHeight?: number;
  disablePopups?: boolean;
}

const AgendaView: React.FC<AgendaViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  itemHeight = 60,
  disablePopups = false
}) => {
  const { isMobile } = useIsMobile();
  
  const prevDay = () => {
    setDate(subDays(date, 1));
  };
  
  const nextDay = () => {
    setDate(addDays(date, 1));
  };
  
  // Group events by date
  const groupedEvents = events.reduce((acc: Record<string, Event[]>, event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(event);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();
  
  // Sort events within each date by start time
  sortedDates.forEach(dateKey => {
    groupedEvents[dateKey].sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return a.startDate.getTime() - b.startDate.getTime();
    });
  });
  
  return (
    <div className="space-y-4">
      <div className={cn(
        "flex items-center",
        isMobile ? "justify-between" : "justify-between"
      )}>
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-[0.95rem] leading-tight" : ""
        )}>
          {format(date, 'MMMM d, yyyy')}
          {isToday(date) && (
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
      
      <ScrollArea className={cn(
        "border rounded-lg overflow-hidden",
        isMobile ? "max-h-[calc(100vh-200px)]" : "max-h-[600px]"
      )}>
        {sortedDates.length > 0 ? (
          <div className="divide-y">
            {sortedDates.map(dateKey => {
              const eventsForDate = groupedEvents[dateKey];
              const eventDate = new Date(dateKey);
              const isCurrentDate = isToday(eventDate);
              
              return (
                <div key={dateKey} className="p-4">
                  <div className={cn(
                    "flex items-center mb-3",
                    isCurrentDate ? "text-primary" : "text-muted-foreground"
                  )}>
                    <Calendar className="h-4 w-4 mr-2" />
                    <h3 className={cn(
                      "font-medium",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {format(eventDate, 'EEEE, MMMM d, yyyy')}
                      {isCurrentDate && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                          Today
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {eventsForDate.map(event => (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-3 rounded-md cursor-pointer hover:opacity-90 transition-opacity",
                          "border-l-4"
                        )}
                        style={{ 
                          borderLeftColor: event.color || '#4285F4',
                          backgroundColor: `${event.color || '#4285F4'}20`
                        }}
                        onClick={() => {
                          if (!disablePopups) {
                            handleViewEvent(event);
                          }
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {event.allDay ? (
                            <span>All day</span>
                          ) : (
                            <span>
                              {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                            </span>
                          )}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No events found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AgendaView;
