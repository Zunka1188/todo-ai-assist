
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, isSameDay, isToday, compareAsc } from 'date-fns';
import { Clock, MapPin, Calendar as CalendarIcon, Paperclip, FileText, Image, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event } from '../types/event';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgendaViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
}

const EnhancedAgendaView: React.FC<AgendaViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, Event[]>>({});
  const [datesWithEvents, setDatesWithEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Process events on component mount or when events change
  useEffect(() => {
    const processEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Sort events by start date
        const sortedEvents = [...events].sort((a, b) => compareAsc(a.startDate, b.endDate));
        
        // Group events by date
        const groupedByDate = sortedEvents.reduce<Record<string, Event[]>>((acc, event) => {
          const dateKey = format(event.startDate, 'yyyy-MM-dd');
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(event);
          return acc;
        }, {});
        
        // Get dates with events
        const dates = Object.keys(groupedByDate).sort();
        
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setGroupedEvents(groupedByDate);
        setDatesWithEvents(dates);
        setIsLoading(false);
      } catch (err) {
        console.error('[ERROR] Calendar: Failed to process agenda events', err);
        setError('Failed to load agenda events');
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load agenda events",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
      }
    };
    
    processEvents();
  }, [events, toast]);
  
  // Function to get formatted time
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-destructive mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Reload
        </button>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-4">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white"
        )}
        aria-live="polite"
        >
          Upcoming events
        </h2>
        
        {datesWithEvents.length === 0 ? (
          <div 
            className="text-center py-8 text-muted-foreground" 
            role="status"
            aria-live="polite"
          >
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-40" aria-hidden="true" />
            <p>No events scheduled</p>
          </div>
        ) : (
          datesWithEvents.map(dateKey => {
            const eventsForDate = groupedEvents[dateKey];
            const eventDate = new Date(dateKey);
            const isCurrentDate = isToday(eventDate);
            
            return (
              <div 
                key={dateKey} 
                className="border rounded-lg overflow-hidden"
                role="region"
                aria-label={`Events for ${format(eventDate, 'EEEE, MMMM d, yyyy')}`}
              >
                <div 
                  className={cn(
                    "p-3 font-medium flex items-center",
                    isCurrentDate 
                      ? "bg-primary text-primary-foreground" 
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
                
                <div className="divide-y">
                  {eventsForDate.map(event => (
                    <div 
                      key={event.id}
                      className="p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => handleViewEvent(event)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Event: ${event.title} at ${getFormattedTime(event.startDate)}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleViewEvent(event);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                          style={{ backgroundColor: event.color || '#4285F4' }}
                          aria-hidden="true"
                        />
                        
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-base",
                            theme === 'light' ? "text-foreground" : "text-white",
                            isMobile ? "text-sm" : ""
                          )}>
                            {event.title}
                          </h3>
                          
                          <div className="mt-2 space-y-1">
                            <p className={cn(
                              "flex items-center text-muted-foreground",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              <Clock className={cn("mr-2", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
                              <span>
                                {event.allDay 
                                  ? 'All day' 
                                  : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                              </span>
                            </p>
                            
                            {event.location && (
                              <p className={cn(
                                "flex items-center text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                <MapPin className={cn("mr-2", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
                                <span className="line-clamp-1">{event.location}</span>
                              </p>
                            )}
                            
                            {event.attachments && event.attachments.length > 0 && (
                              <p className={cn(
                                "flex items-center text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                <Paperclip className={cn("mr-2", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
                                <span>
                                  {event.attachments.length} attachment{event.attachments.length !== 1 ? 's' : ''}
                                </span>
                                
                                <span className="flex ml-2">
                                  {event.attachments.slice(0, 3).map((attachment) => (
                                    <span key={attachment.id} className="mr-1" title={attachment.name}>
                                      {attachment.type === 'image' ? (
                                        <Image className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
                                      ) : (
                                        <FileText className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
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
                            <p className={cn(
                              "mt-2 text-muted-foreground line-clamp-2",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};

export default EnhancedAgendaView;
