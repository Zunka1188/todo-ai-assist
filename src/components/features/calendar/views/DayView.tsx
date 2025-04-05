import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Event } from '../types/event';
import { getFormattedTime } from '../utils/dateUtils';

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
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
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
  
  const hours = showAllHours 
    ? Array.from({ length: 24 }, (_, i) => i) 
    : Array.from({ length: (endHour - startHour) + 1 }, (_, i) => i + startHour);
  
  const isCurrentDate = isToday(date);

  const calculateEventPosition = (eventTime: Date) => {
    const minutes = eventTime.getMinutes();
    return (minutes / 60) * 100;
  };

  const getEventStyle = (event: Event, currentHour: number) => {
    const startHourOfEvent = event.startDate.getHours();
    const startMinutes = event.startDate.getMinutes();
    const endHourOfEvent = event.endDate.getHours();
    const endMinutes = event.endDate.getMinutes();
    
    if (startHourOfEvent === currentHour) {
      const topPosition = (startMinutes / 60) * 100;
      
      if (endHourOfEvent === currentHour) {
        const height = ((endMinutes - startMinutes) / 60) * 100;
        return {
          top: `${topPosition}%`,
          height: `${height}%`,
          position: 'absolute',
          width: '95%',
          zIndex: 10
        };
      } 
      else {
        return {
          top: `${topPosition}%`,
          height: `${100 - topPosition}%`,
          position: 'absolute',
          width: '95%',
          zIndex: 10
        };
      }
    } 
    else if (endHourOfEvent === currentHour) {
      const height = (endMinutes / 60) * 100;
      return {
        top: '0%',
        height: `${height}%`,
        position: 'absolute',
        width: '95%',
        zIndex: 10
      };
    } 
    else if (startHourOfEvent < currentHour && endHourOfEvent > currentHour) {
      return {
        top: '0%',
        height: '100%',
        position: 'absolute',
        width: '95%',
        zIndex: 10
      };
    }
    
    return {};
  };

  const checkForHiddenEvents = (start: number, end: number) => {
    const hidden = timeEvents.filter(event => {
      const eventStartHour = event.startDate.getHours();
      const eventEndHour = event.endDate.getHours();
      
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

  const handleTimeRangeToggle = (preset: string) => {
    switch (preset) {
      case 'full':
        setStartHour(0);
        setEndHour(23);
        setStartInputValue("0");
        setEndInputValue("23");
        setShowAllHours(true);
        setHiddenEvents([]);
        break;
      case 'business':
        setStartHour(8);
        setEndHour(18);
        setStartInputValue("8");
        setEndInputValue("18");
        setShowAllHours(false);
        checkForHiddenEvents(8, 18);
        break;
      case 'evening':
        setStartHour(17);
        setEndHour(23);
        setStartInputValue("17");
        setEndInputValue("23");
        setShowAllHours(false);
        checkForHiddenEvents(17, 23);
        break;
      case 'morning':
        setStartHour(4);
        setEndHour(12);
        setStartInputValue("4");
        setEndInputValue("12");
        setShowAllHours(false);
        checkForHiddenEvents(4, 12);
        break;
    }
  };

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartInputValue(value);
    } else {
      setEndInputValue(value);
    }
    
    if (value.trim() === '') {
      return;
    }
    
    const hour = parseInt(value, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return;
    }
    
    let newStart = startHour;
    let newEnd = endHour;
    
    if (type === 'start') {
      if (hour <= endHour) newStart = hour;
    } else {
      if (hour >= startHour) newEnd = hour;
    }
    
    checkForHiddenEvents(newStart, newEnd);
    
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    
    setShowAllHours(newStart === 0 && newEnd === 23);
  };

  const handleInputBlur = (type: 'start' | 'end') => {
    if (type === 'start') {
      const value = startInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setStartInputValue(startHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour > endHour) {
        setStartInputValue(startHour.toString());
      } else {
        setStartHour(hour);
        setStartInputValue(hour.toString());
      }
    } else {
      const value = endInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setEndInputValue(endHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour < startHour) {
        setEndInputValue(endHour.toString());
      } else {
        setEndHour(hour);
        setEndInputValue(hour.toString());
      }
    }
    
    setShowAllHours(startHour === 0 && endHour === 23);
  };

  const getUniqueEventsByHour = (hour: number) => {
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);
    
    const hourEndDate = new Date(date);
    hourEndDate.setHours(hour, 59, 59, 999);
    
    return timeEvents.filter(event => {
      const eventStartHour = event.startDate.getHours();
      
      if (event.startDate >= hourDate && event.startDate <= hourEndDate) {
        return true;
      } else if (event.startDate <= hourDate && event.endDate >= hourEndDate && eventStartHour < hour && hour === startHour) {
        return true;
      }
      
      return false;
    });
  };

  return (
    <div className="space-y-4">
      <div className={cn(
        "flex items-center",
        isMobile ? "justify-between" : "justify-between"
      )}>
        <h2 className={cn(
          "text-xl font-semibold flex items-center",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-[0.95rem] leading-tight" : ""
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
      
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Toggle
            pressed={showAllHours}
            onPressedChange={() => handleTimeRangeToggle('full')}
            className="bg-transparent data-[state=on]:bg-todo-purple data-[state=on]:text-primary-foreground tap-target"
          >
            Full 24h
          </Toggle>
          <Toggle
            pressed={startHour === 8 && endHour === 18}
            onPressedChange={() => handleTimeRangeToggle('business')}
            className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
          >
            Business hours
          </Toggle>
          <Toggle
            pressed={startHour === 17 && endHour === 23}
            onPressedChange={() => handleTimeRangeToggle('evening')}
            className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
          >
            Evening
          </Toggle>
          <Toggle
            pressed={startHour === 4 && endHour === 12}
            onPressedChange={() => handleTimeRangeToggle('morning')}
            className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
          >
            Morning
          </Toggle>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="startHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>From:</Label>
              <Input
                id="startHour"
                type="text"
                inputMode="numeric"
                min="0"
                max="23"
                value={startInputValue}
                onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                onBlur={() => handleInputBlur('start')}
                className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Label htmlFor="endHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>To:</Label>
              <Input
                id="endHour"
                type="text"
                inputMode="numeric"
                min="0"
                max="23"
                value={endInputValue}
                onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                onBlur={() => handleInputBlur('end')}
                className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
              />
            </div>
          </div>
        </div>
        
        {hiddenEvents.length > 0 && (
          <Alert 
            className="py-2 mt-3 bg-amber-100/90 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 text-amber-800 dark:text-amber-200 flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <AlertDescription className={cn("text-sm", isMobile ? "text-[0.8rem]" : "")}>
              Warning: {hiddenEvents.length} event{hiddenEvents.length > 1 ? 's' : ''} {hiddenEvents.length > 1 ? 'are' : 'is'} outside the selected time range and {hiddenEvents.length > 1 ? 'are' : 'is'} not visible.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {allDayEvents.length > 0 && (
        <div className="border rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-[1fr] bg-muted/30 p-2 border-b">
            <div className={cn("text-sm font-medium", isMobile ? "text-[0.8rem]" : "")}>All day events</div>
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
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[4rem_1fr] bg-muted/30 p-2 border-b">
          <div className={cn("text-sm font-medium", isMobile ? "text-[0.8rem]" : "")}>Time</div>
          <div className={cn("text-sm font-medium", isMobile ? "text-[0.8rem]" : "")}>Events</div>
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
            
            const now = new Date();
            const isCurrentHour = isCurrentDate && now.getHours() === hour;
            const hourEvents = getUniqueEventsByHour(hour);
            
            return (
              <div 
                key={hour} 
                className={cn(
                  "grid grid-cols-[4rem_1fr] border-b min-h-[80px]",
                  isCurrentHour && "bg-accent/20"
                )}
              >
                <div className={cn("p-2 text-sm text-right text-muted-foreground border-r", isMobile ? "text-[0.8rem]" : "")}>
                  {format(hourDate, 'h a')}
                </div>
                
                <div className="p-2 relative min-h-[80px]">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className="rounded p-2 cursor-pointer hover:opacity-90 touch-manipulation absolute"
                      style={{ 
                        backgroundColor: event.color || '#4285F4',
                        ...getEventStyle(event, hour)
                      }}
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="font-medium text-white truncate">{event.title}</div>
                      <div className="text-xs flex items-center text-white/90 mt-1">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}</span>
                      </div>
                      {event.location && (
                        <div className="text-xs flex items-center text-white/90 mt-1">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
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
      </div>
    </div>
  );
};

export default DayView;
