
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
import { getFormattedTime } from '../utils/dateUtils';
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
  
  // Check if an event is visible in the current view
  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    
    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndMinute = event.endDate.getMinutes();
    
    // For precise comparison include minutes as decimal
    const eventStart = eventStartHour + (eventStartMinute / 60);
    const eventEnd = eventEndHour + (eventEndMinute / 60);
    
    // Check if at least part of the event falls within visible hours
    return eventStart < endHour && eventEnd > startHour;
  };
  
  const hiddenEvents = events.filter(event => 
    !event.allDay && !isEventVisible(event)
  );

  // Group overlapping events
  const groupOverlappingEvents = (events: Event[]): Event[][] => {
    if (events.length === 0) return [];
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    const groups: Event[][] = [];
    let currentGroup: Event[] = [sortedEvents[0]];
    
    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const previousEvent = sortedEvents[i - 1];
      
      // Check if current event overlaps with previous event in the current group
      if (event.startDate < previousEvent.endDate) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    }
    
    // Add the last group if not empty
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
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
      
      // Check if the event is visible in the current time range
      if (!isEventVisible(event)) return false;
      
      return true;
    });
  };

  // Calculate position for multi-hour events with overlapping support
  const getMultiHourEventStyle = (event: Event, day: Date, totalOverlapping = 1, index = 0): React.CSSProperties => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Set up date objects for the current day
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    // If event starts before this day, use day start as event start
    const effectiveStartDate = eventStart < dayStart ? dayStart : eventStart;
    
    // If event ends after this day, use day end as event end
    const effectiveEndDate = eventEnd > dayEnd ? dayEnd : eventEnd;
    
    // Get hours and minutes for precise positioning
    const startHourValue = effectiveStartDate.getHours();
    const startMinValue = effectiveStartDate.getMinutes() / 60;
    const endHourValue = effectiveEndDate.getHours();
    const endMinValue = effectiveEndDate.getMinutes() / 60;
    
    // Calculate visible range (use precise decimal hours)
    const visibleStartHour = Math.max(startHourValue, startHour);
    const visibleEndHour = Math.min(endHourValue, endHour);
    
    // Include minutes for precise positioning
    const visibleStartDecimal = visibleStartHour + (startHourValue === visibleStartHour ? startMinValue : 0);
    const visibleEndDecimal = visibleEndHour + (endHourValue === visibleEndHour ? endMinValue : 0);
    
    // Calculate top position - how many hours into the visible range this event starts
    const hoursFromVisibleStart = visibleStartDecimal - startHour;
    
    // Calculate visible event duration
    const visibleDurationHours = visibleEndDecimal - visibleStartDecimal;
    
    // Each cell height is fixed at 60px
    const hourHeight = 60;
    const topPx = hoursFromVisibleStart * hourHeight;
    const heightPx = Math.max(visibleDurationHours * hourHeight, 20); // Min height for very short events
    
    // Calculate width and position for overlapping events
    const baseWidth = 11.0; // Slightly narrower width percentage
    const widthPerEvent = baseWidth / totalOverlapping;
    
    // Calculate the column index (0-6) for the current day
    const dayColumnIndex = daysInWeek.findIndex(d => isSameDay(d, day));
    
    // Calculate left position based on day column and overlap index
    // Each day column should be ~12% wide (100% / 8) with the first column for time
    const dayColumnWidth = 12.5;
    const leftOffset = (dayColumnWidth * (dayColumnIndex + 1) + 0.5) + (index * (widthPerEvent / totalOverlapping));
    
    return {
      position: 'absolute',
      top: `${topPx}px`,
      height: `${heightPx}px`, 
      left: `${leftOffset}%`,
      width: `${widthPerEvent - 0.25}%`, // Slightly narrower to avoid overlap
      zIndex: 20,
    };
  };

  // Helper to get visible multi-hour events grouped by overlapping
  const getVisibleMultiHourEventGroups = (day: Date): Event[][] => {
    const dayEvents = getMultiHourEventsForDay(day);
    return groupOverlappingEvents(dayEvents);
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
    
    // Check for hidden events with new time range
    const hidden = events.filter(event => {
      if (event.allDay) return false;
      
      const eventStartHour = event.startDate.getHours();
      const eventStartMinute = event.startDate.getMinutes();
      const eventEndHour = event.endDate.getHours();
      const eventEndMinute = event.endDate.getMinutes();
      
      // For precise comparison include minutes as decimal
      const eventStart = eventStartHour + (eventStartMinute / 60);
      const eventEnd = eventEndHour + (eventEndMinute / 60);
      
      return eventEnd <= newStart || eventStart >= newEnd;
    });
    
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
            {daysInWeek.map((day, dayIndex) => {
              const eventGroups = getVisibleMultiHourEventGroups(day);
              return (
                <React.Fragment key={`multi-${dayIndex}`}>
                  {eventGroups.map((group, groupIndex) => (
                    <React.Fragment key={`group-${dayIndex}-${groupIndex}`}>
                      {group.map((event, eventIndex) => (
                        <div 
                          key={`multi-${event.id}-${dayIndex}`} 
                          className="absolute text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                          style={{
                            backgroundColor: event.color || '#4285F4',
                            ...getMultiHourEventStyle(event, day, group.length, eventIndex)
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
                </React.Fragment>
              );
            })}
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
                      {/* Events are rendered in the overlay */}
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
