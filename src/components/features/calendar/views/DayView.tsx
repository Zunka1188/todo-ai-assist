
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [showAllHours, setShowAllHours] = useState(true);
  const [hiddenEvents, setHiddenEvents] = useState<Event[]>([]);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

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
  
  // Create hours array for the time column based on current time range settings
  const hours = showAllHours 
    ? Array.from({ length: 24 }, (_, i) => i) 
    : Array.from({ length: (endHour - startHour) + 1 }, (_, i) => i + startHour);
  
  const isCurrentDate = isToday(date);

  const checkForHiddenEvents = (start: number, end: number) => {
    // Only consider time events (not all-day events)
    const hidden = timeEvents.filter(event => {
      const eventStartHour = event.startDate.getHours();
      const eventEndHour = event.endDate.getHours();
      
      // Event is hidden if it starts or ends outside the visible range
      return (eventStartHour < start && eventEndHour < start) || 
             (eventStartHour > end && eventEndHour > end);
    });

    setHiddenEvents(hidden);
    
    if (hidden.length > 0) {
      toast({
        title: "Warning: Hidden Events",
        description: `${hidden.length} event${hidden.length === 1 ? '' : 's'} will be hidden with this time range.`,
        variant: "default",
      });
    }
    
    return hidden;
  };

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    const hour = parseInt(value, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) return;
    
    let newStart = startHour;
    let newEnd = endHour;
    
    if (type === 'start') {
      if (hour <= endHour) newStart = hour;
      else return;
    } else {
      if (hour >= startHour) newEnd = hour;
      else return;
    }
    
    // Check if this change would hide any events
    checkForHiddenEvents(newStart, newEnd);
    
    // Update the state
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    
    setShowAllHours(newStart === 0 && newEnd === 23);
  };

  return (
    <div className="space-y-4">
      <div className={cn(
        "flex justify-between items-center",
        isMobile ? "flex-col space-y-2" : ""
      )}>
        <h2 className={cn(
          "text-xl font-semibold flex items-center",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-lg self-start" : ""
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
            className="tap-target"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextDay}
            aria-label="Next day"
            className="tap-target"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Time range selector */}
      <div className={cn(
        "flex items-center gap-4",
        isMobile ? "flex-col items-start" : "flex-wrap"
      )}>
        <div className="flex items-center gap-2">
          <Button 
            variant={showAllHours ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setStartHour(0);
              setEndHour(23);
              setShowAllHours(true);
              setHiddenEvents([]);
            }}
            className="tap-target"
          >
            Full 24h
          </Button>
        </div>
        
        <div className={cn(
          "flex items-center gap-3",
          isMobile ? "w-full" : ""
        )}>
          <div className="flex items-center gap-1">
            <Label htmlFor="startHour" className="text-sm whitespace-nowrap">From:</Label>
            <Input
              id="startHour"
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => handleTimeRangeChange('start', e.target.value)}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Label htmlFor="endHour" className="text-sm whitespace-nowrap">To:</Label>
            <Input
              id="endHour"
              type="number"
              min="0"
              max="23"
              value={endHour}
              onChange={(e) => handleTimeRangeChange('end', e.target.value)}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
        </div>
      </div>
      
      {/* Warning for hidden events */}
      {hiddenEvents.length > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">
            Warning: {hiddenEvents.length} event{hiddenEvents.length === 1 ? '' : 's'} {hiddenEvents.length === 1 ? 'is' : 'are'} hidden with the current time range.
          </AlertDescription>
        </Alert>
      )}
      
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
                className="rounded p-3 cursor-pointer hover:opacity-90 flex items-center touch-manipulation"
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
        
        <div className={cn(
          "overflow-y-auto",
          isMobile ? "max-h-[calc(100vh-320px)]" : "max-h-[600px]"
        )}>
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
                      className="rounded p-2 cursor-pointer hover:opacity-90 touch-manipulation"
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
