
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { format, isSameDay, isToday, compareAsc, addDays } from 'date-fns';
import { Clock, MapPin, Calendar as CalendarIcon, Paperclip, FileText, Image, ChevronRight, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  attachments?: Array<{
    id: string;
    type: 'image' | 'document';
    name: string;
    url: string;
    thumbnailUrl?: string;
  }>;
}

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
  itemHeight = 64,
  disablePopups = false
}) => {
  const { isMobile } = useIsMobile();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Sort events by start date
  const sortedEvents = React.useMemo(() => 
    [...events].sort((a, b) => compareAsc(a.startDate, b.endDate)), 
    [events]
  );
  
  // Group events by date
  const eventsByDate = React.useMemo(() => {
    return sortedEvents.reduce<Record<string, Event[]>>((acc, event) => {
      const dateKey = format(event.startDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [sortedEvents]);
  
  // Get dates with events
  const datesWithEvents = Object.keys(eventsByDate).sort();
  
  // Function to get formatted time
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Navigation functions
  const prevDay = () => {
    setDate(addDays(date, -1));
  };

  const nextDay = () => {
    setDate(addDays(date, 1));
  };
  
  // Scroll to today's events if available
  useEffect(() => {
    if (!scrollRef.current) return;
    
    // Find today's events section
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayElement = document.getElementById(`date-${today}`);
    
    if (todayElement) {
      scrollRef.current.scrollTo({
        top: todayElement.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  }, [datesWithEvents]);

  // Handle click event with optional popup disabling
  const handleEventClick = (event: Event) => {
    if (disablePopups) return;
    handleViewEvent(event);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-base" : ""
        )}>
          Upcoming events
        </h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevDay} 
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextDay} 
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea 
        className="h-[calc(100vh-220px)]"
        ref={scrollRef}
      >
        <div className="space-y-6 px-4 py-4" role="list" aria-label="Agenda events">
          {datesWithEvents.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 bg-card/50">
              <CalendarIcon className="h-12 w-12 mb-4 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">No events scheduled</p>
            </Card>
          ) : (
            datesWithEvents.map(dateKey => {
              const eventsForDate = eventsByDate[dateKey];
              const eventDate = new Date(dateKey);
              const isCurrentDate = isToday(eventDate);
              
              return (
                <Card 
                  id={`date-${dateKey}`}
                  key={dateKey} 
                  className="overflow-hidden shadow-sm" 
                  role="group" 
                  aria-label={`Events for ${format(eventDate, 'EEEE, MMMM d, yyyy')}`}
                >
                  <div 
                    className={cn(
                      "p-3 font-medium flex items-center",
                      isCurrentDate 
                        ? "bg-purple-600 text-white dark:bg-purple-700" 
                        : "bg-muted/30 text-foreground dark:text-white"
                    )}
                  >
                    {format(eventDate, 'EEEE, MMMM d, yyyy')}
                    {isCurrentDate && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-background text-foreground rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  
                  <div className="divide-y divide-border">
                    {eventsForDate.map(event => (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-muted/40 transition-colors flex items-start gap-3",
                          disablePopups ? "cursor-default" : "cursor-pointer"
                        )}
                        style={{minHeight: `${itemHeight}px`}}
                        onClick={() => handleEventClick(event)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Event: ${event.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleEventClick(event);
                          }
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                          style={{ backgroundColor: event.color || '#4285F4' }}
                        />
                        
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-base",
                            theme === 'light' ? "text-foreground" : "text-white"
                          )}>
                            {event.title}
                          </h3>
                          
                          <div className="mt-2 space-y-1">
                            <p className="text-sm flex items-center text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-2" />
                              {event.allDay 
                                ? 'All day' 
                                : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                            </p>
                            
                            {event.location && (
                              <p className="text-sm flex items-center text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 mr-2" />
                                {event.location}
                              </p>
                            )}
                            
                            {event.attachments && event.attachments.length > 0 && (
                              <p className="text-sm flex items-center text-muted-foreground">
                                <Paperclip className="h-3.5 w-3.5 mr-2" />
                                {event.attachments.length} attachment{event.attachments.length !== 1 ? 's' : ''}
                                
                                <span className="flex ml-2">
                                  {event.attachments.slice(0, 3).map((attachment) => (
                                    <span key={attachment.id} className="mr-1" title={attachment.name}>
                                      {attachment.type === 'image' ? (
                                        <Image className="h-3.5 w-3.5" />
                                      ) : (
                                        <FileText className="h-3.5 w-3.5" />
                                      )}
                                    </span>
                                  ))}
                                  {event.attachments.length > 3 && (
                                    <span className="text-xs">+{event.attachments.length - 3}</span>
                                  )}
                                </span>
                              </p>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgendaView;
