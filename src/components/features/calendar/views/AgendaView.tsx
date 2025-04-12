
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isSameDay, isToday, compareAsc, addDays } from 'date-fns';
import { Clock, MapPin, Calendar as CalendarIcon, Paperclip, FileText, Image } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
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
}

const AgendaView: React.FC<AgendaViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  itemHeight = 64
}) => {
  const { isMobile } = useIsMobile();

  // Sort events by start date
  const sortedEvents = [...events].sort((a, b) => compareAsc(a.startDate, b.endDate));
  
  // Group events by date
  const eventsByDate = sortedEvents.reduce<Record<string, Event[]>>((acc, event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});
  
  // Get dates with events
  const datesWithEvents = Object.keys(eventsByDate).sort();
  
  // Function to get formatted time
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      </div>
      
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-6 px-4 py-4">
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
                <Card key={dateKey} className="overflow-hidden shadow-sm">
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
                        className="p-4 cursor-pointer hover:bg-muted/40 transition-colors flex items-start gap-3"
                        style={{minHeight: `${itemHeight}px`}}
                        onClick={() => handleViewEvent(event)}
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
