import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getFormattedTime, isOutOfTimeRange } from '../utils/dateUtils';
import { Event } from '../types/event';

interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1 // Default to Monday
}) => {
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [showFullDay, setShowFullDay] = useState(true);
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd
  });
  
  const prevWeek = () => {
    setDate(subWeeks(date, 1));
  };
  
  const nextWeek = () => {
    setDate(addWeeks(date, 1));
  };
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(event.startDate, day) || 
      isSameDay(event.endDate, day) || 
      (event.startDate <= day && event.endDate >= day)
    );
  };

  const hours = Array.from({
    length: endHour - startHour + 1
  }, (_, i) => startHour + i);
  
  const hiddenEvents = events.filter(event => isOutOfTimeRange(event, startHour, endHour));

  // Helper function to calculate position within the hour
  const calculateEventPosition = (event: Event, day: Date, hour: number): React.CSSProperties => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const sameDay = isSameDay(eventStart, day);
    
    // If event doesn't start on this day, position it at the top of the first visible hour
    if (!sameDay) {
      return {
        top: '0%',
        height: '100%',
        position: 'absolute',
        width: '95%',
        zIndex: 10,
      };
    }
    
    const eventStartHour = eventStart.getHours();
    const eventStartMinute = eventStart.getMinutes();
    const eventEndHour = eventEnd.getHours();
    const eventEndMinute = eventEnd.getMinutes();
    
    // If event starts in this hour
    if (eventStartHour === hour) {
      const topPosition = (eventStartMinute / 60) * 100;
      
      // If event also ends in this hour
      if (eventEndHour === hour && isSameDay(eventStart, eventEnd)) {
        const height = ((eventEndMinute - eventStartMinute) / 60) * 100;
        return {
          top: `${topPosition}%`,
          height: `${height}%`,
          position: 'absolute',
          width: '95%',
          zIndex: 10,
        };
      }
      
      // If event extends beyond this hour
      return {
        top: `${topPosition}%`,
        height: `${100 - topPosition}%`,
        position: 'absolute',
        width: '95%',
        zIndex: 10,
      };
    }
    
    // If event ends in this hour
    if (eventEndHour === hour && isSameDay(eventEnd, day)) {
      const height = (eventEndMinute / 60) * 100;
      return {
        top: '0%',
        height: `${height}%`,
        position: 'absolute',
        width: '95%',
        zIndex: 10,
      };
    }
    
    // If hour is between event start and end
    if ((eventStartHour < hour && eventEndHour > hour) || 
        (eventStartHour < hour && !isSameDay(eventStart, eventEnd))) {
      return {
        top: '0%',
        height: '100%',
        position: 'absolute',
        width: '95%',
        zIndex: 10,
      };
    }
    
    return {};
  };

  // Get unique events for each hour/day cell to avoid duplicates
  const getUniqueEventsForHourAndDay = (day: Date, hour: number) => {
    const dayHourStart = new Date(day);
    dayHourStart.setHours(hour, 0, 0, 0);
    
    const dayHourEnd = new Date(day);
    dayHourEnd.setHours(hour, 59, 59, 999);
    
    return events.filter(event => {
      if (event.allDay) return false;
      
      const sameDay = isSameDay(event.startDate, day) || 
                     isSameDay(event.endDate, day) || 
                     (event.startDate <= day && event.endDate >= day);
      
      if (!sameDay) return false;
      
      const eventStartDate = new Date(event.startDate);
      const eventStartHour = eventStartDate.getHours();
      const eventEndDate = new Date(event.endDate);
      const eventEndHour = eventEndDate.getHours();
      
      // Only show events that:
      // 1. Start in this specific hour and day
      if (isSameDay(eventStartDate, day) && eventStartHour === hour) {
        return true;
      }
      
      // 2. Start in a previous hour/day but end in this hour/day
      if (
        ((isSameDay(eventEndDate, day) && eventEndHour === hour) ||
        (!isSameDay(eventStartDate, day) && hour === startHour))
      ) {
        // This helps prevent duplicate events
        // Only show if this is the first visible hour of the day for this event
        if (!isSameDay(eventStartDate, day) && hour === startHour) {
          return true;
        }
      }
      
      return false;
    });
  };

  // Get multi-day/multi-hour events for a specific day
  const getMultiHourEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (event.allDay) return false;
      
      // Check if event is on this day
      const sameDay = isSameDay(event.startDate, day) || 
                      isSameDay(event.endDate, day) || 
                      (event.startDate <= day && event.endDate >= day);
      
      if (!sameDay) return false;
      
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();
      
      // Multi-hour event
      return (eventEndHour - eventStartHour) > 0;
    });
  };

  // Calculate position for multi-hour events
  const getMultiHourEventStyle = (event: Event, day: Date): React.CSSProperties => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Set up date objects for the current day
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    // If event starts before this day, use day start as event start
    const effectiveStartDate = isSameDay(eventStart, day) ? eventStart : new Date(day);
    effectiveStartDate.setHours(
      isSameDay(eventStart, day) ? eventStart.getHours() : startHour,
      isSameDay(eventStart, day) ? eventStart.getMinutes() : 0,
      0, 0
    );
    
    // If event ends after this day, use day end as event end
    const effectiveEndDate = isSameDay(eventEnd, day) ? eventEnd : new Date(day);
    effectiveEndDate.setHours(
      isSameDay(eventEnd, day) ? eventEnd.getHours() : endHour,
      isSameDay(eventEnd, day) ? eventEnd.getMinutes() : 59,
      59, 999
    );
    
    // Calculate visible range
    const visibleStartHour = Math.max(effectiveStartDate.getHours(), startHour);
    const visibleEndHour = Math.min(effectiveEndDate.getHours(), endHour);
    
    // Time values
    const visibleStartMinute = effectiveStartDate.getHours() === visibleStartHour 
      ? effectiveStartDate.getMinutes() 
      : 0;
    
    const visibleEndMinute = effectiveEndDate.getHours() === visibleEndHour 
      ? effectiveEndDate.getMinutes() 
      : 59;
    
    // Calculate top position - how many hours into the visible range this event starts
    const hoursFromVisibleStart = visibleStartHour - startHour;
    const minutesFromStartHour = visibleStartMinute / 60; // Convert to hour fraction
    
    // Calculate visible event duration
    const visibleDurationHours = (visibleEndHour - visibleStartHour) + 
      (visibleEndMinute - visibleStartMinute) / 60;
    
    // Each cell height is fixed at 60px
    const hourHeight = 60;
    const topPx = (hoursFromVisibleStart + minutesFromStartHour) * hourHeight;
    const heightPx = visibleDurationHours * hourHeight;
    
    return {
      position: 'absolute',
      top: `${topPx}px`,
      height: `${heightPx}px`, 
      width: '95%',
      zIndex: 20,
    };
  };

  // Check if an event is visible in the current view
  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    
    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    
    // Check if at least part of the event falls within visible hours
    return !(eventEndHour < startHour || eventStartHour > endHour);
  };

  // Filter events to only include those that should be shown in the multi-hour section
  const getVisibleMultiHourEventsForDay = (day: Date): Event[] => {
    const multiHourEvents = getMultiHourEventsForDay(day);
    return multiHourEvents.filter(event => isEventVisible(event));
  };

  const handleTimeRangeToggle = (preset: string) => {
    switch (preset) {
      case 'full':
        setStartHour(0);
        setEndHour(23);
        setStartInputValue("0");
        setEndInputValue("23");
        setShowFullDay(true);
        break;
      case 'business':
        setStartHour(8);
        setEndHour(18);
        setStartInputValue("8");
        setEndInputValue("18");
        setShowFullDay(false);
        break;
      case 'evening':
        setStartHour(17);
        setEndHour(23);
        setStartInputValue("17");
        setEndInputValue("23");
        setShowFullDay(false);
        break;
      case 'morning':
        setStartHour(4);
        setEndHour(12);
        setStartInputValue("4");
        setEndInputValue("12");
        setShowFullDay(false);
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
    
    const hidden = events.filter(event => isOutOfTimeRange(event, newStart, newEnd));
    
    if (hidden.length > 0) {
      toast({
        title: "Warning: Hidden Events",
        description: `${hidden.length} event${hidden.length === 1 ? '' : 's'} will be hidden with this time range.`,
        variant: "default",
      });
    }
    
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    
    setShowFullDay(newStart === 0 && newEnd === 23);
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
    
    setShowFullDay(startHour === 0 && endHour === 23);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-[0.95rem] leading-tight" : ""
        )}>
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevWeek} 
            aria-label="Previous week"
            className="tap-target"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextWeek} 
            aria-label="Next week"
            className="tap-target"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Toggle
            pressed={showFullDay}
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
              <Label htmlFor="weekStartHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>From:</Label>
              <Input
                id="weekStartHour"
                type="text"
                inputMode="numeric"
                value={startInputValue}
                onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                onBlur={() => handleInputBlur('start')}
                className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Label htmlFor="weekEndHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>To:</Label>
              <Input
                id="weekEndHour"
                type="text"
                inputMode="numeric"
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
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 divide-x border-b">
          <div className={cn("p-2 text-sm font-medium bg-muted/30", isMobile ? "text-[0.8rem]" : "")}>All Day</div>
          {daysInWeek.map((day, index) => {
            const allDayEvents = getEventsForDay(day).filter(event => event.allDay);
            const isCurrentDate = isToday(day);
            return (
              <div 
                key={index} 
                className={cn("p-1 min-h-[60px]", isCurrentDate && "bg-accent/30")}
              >
                {allDayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                    style={{backgroundColor: event.color || '#4285F4'}}
                    onClick={() => handleViewEvent(event)}
                  >
                    <span className="text-white truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-8 divide-x border-b">
          <div className={cn("p-2 text-sm font-medium bg-muted/30", isMobile ? "text-[0.8rem]" : "")}>Time / Day</div>
          {daysInWeek.map((day, index) => {
            const isCurrentDate = isToday(day);
            return (
              <div 
                key={index} 
                className={cn("p-2 text-center", isCurrentDate && "bg-accent/30")}
              >
                <div className={cn("font-medium", isMobile ? "text-[0.8rem]" : "")}>
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-sm", 
                  isCurrentDate ? "text-primary font-semibold" : "text-muted-foreground",
                  isMobile ? "text-[0.8rem]" : ""
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={cn(
          "overflow-y-auto relative",
          isMobile ? "max-h-[calc(100vh-320px)]" : "max-h-[600px]"
        )}>
          {/* Multi-hour events container that overlays the grid */}
          <div className="relative">
            {daysInWeek.map((day, dayIndex) => (
              <React.Fragment key={`multi-${dayIndex}`}>
                {getVisibleMultiHourEventsForDay(day).map(event => (
                  <div 
                    key={`multi-${event.id}-${dayIndex}`} 
                    className="absolute text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                    style={{
                      backgroundColor: event.color || '#4285F4',
                      ...getMultiHourEventStyle(event, day),
                      left: `calc(${dayIndex + 1} * 12.5%)`,
                      width: '11%',
                    }}
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex items-center">
                      <Clock className="h-2.5 w-2.5 mr-1 text-white flex-shrink-0" />
                      <span className="text-white truncate">{event.title}</span>
                    </div>
                    <div className="text-white/90 text-[10px] truncate">
                      {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                    </div>
                    {event.location && (
                      <div className="text-white/90 text-[10px] flex items-center truncate">
                        <MapPin className="h-2.5 w-2.5 mr-0.5 text-white/80 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          
          {/* Hour rows */}
          {hours.map(hour => {
            const hourDate = new Date();
            hourDate.setHours(hour, 0, 0, 0);
            return (
              <div key={hour} className="grid grid-cols-8 divide-x border-b min-h-[60px]">
                <div className={cn(
                  "p-2 text-xs text-right text-muted-foreground bg-muted/30",
                  isMobile ? "text-[0.7rem]" : ""
                )}>
                  {format(hourDate, 'h a')}
                </div>
                
                {/* Day columns */}
                {daysInWeek.map((day, dayIndex) => {
                  const isCurrentDate = isToday(day);
                  const now = new Date();
                  const isCurrentHour = isToday(day) && now.getHours() === hour;
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "p-1 relative min-h-[60px]", 
                        isCurrentDate && "bg-accent/20", 
                        isCurrentHour && "bg-accent/40"
                      )}
                    >
                      {/* We don't need to render single-hour events here anymore,
                          they're included in the multi-hour events overlay */}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
