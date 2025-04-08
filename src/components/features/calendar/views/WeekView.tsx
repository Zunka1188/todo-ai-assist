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
import ResponsiveContainer from '@/components/ui/responsive-container';

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
  
  const HOUR_HEIGHT = 60; // Height in pixels for each hour block in Week View
  const MINUTES_PER_HOUR = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / MINUTES_PER_HOUR; // Height in pixels for 1 minute
  const TIME_COLUMN_WIDTH = 12.5; // Percentage width of time column
  
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
  
  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    
    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndMinute = event.endDate.getMinutes();
    
    const eventStart = eventStartHour + (eventStartMinute / MINUTES_PER_HOUR);
    const eventEnd = eventEndHour + (eventEndMinute / MINUTES_PER_HOUR);
    
    return eventStart < endHour && eventEnd > startHour;
  };
  
  const hiddenEvents = events.filter(event => 
    !event.allDay && !isEventVisible(event)
  );

  const groupOverlappingEvents = (events: Event[]): Event[][] => {
    if (events.length === 0) return [];
    
    const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    const groups: Event[][] = [];
    let currentGroup: Event[] = [sortedEvents[0]];
    
    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const previousEvent = sortedEvents[i - 1];
      
      if (event.startDate < previousEvent.endDate) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  const getMultiHourEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (event.allDay) return false;
      
      const sameDay = isSameDay(event.startDate, day) || 
                      isSameDay(event.endDate, day) || 
                      (event.startDate <= day && event.endDate >= day);
      
      if (!sameDay) return false;
      
      if (!isEventVisible(event)) return false;
      
      return true;
    });
  };

  const getMultiHourEventStyle = (event: Event, day: Date, totalOverlapping = 1, index = 0): React.CSSProperties => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const effectiveStartDate = eventStart < dayStart ? dayStart : eventStart;
    const effectiveEndDate = eventEnd > dayEnd ? dayEnd : eventEnd;
    
    const startHourDecimal = effectiveStartDate.getHours() + (effectiveStartDate.getMinutes() / MINUTES_PER_HOUR);
    const endHourDecimal = effectiveEndDate.getHours() + (effectiveEndDate.getMinutes() / MINUTES_PER_HOUR);
    
    const visibleStartHourDecimal = Math.max(startHourDecimal, startHour);
    const visibleEndHourDecimal = Math.min(endHourDecimal, endHour + 1);
    
    const topPosition = (visibleStartHourDecimal - startHour) * HOUR_HEIGHT;
    const heightValue = Math.max((visibleEndHourDecimal - visibleStartHourDecimal) * HOUR_HEIGHT, 20);
    
    const dayColumnIndex = daysInWeek.findIndex(d => isSameDay(d, day));
    
    const eventWidth = 10.5 / totalOverlapping;
    
    const leftOffset = (TIME_COLUMN_WIDTH * (dayColumnIndex + 1)) + 1 + (index * eventWidth);
    
    return {
      position: 'absolute',
      top: `${topPosition}px`,
      height: `${heightValue}px`, 
      left: `${leftOffset}%`,
      width: `${eventWidth - 0.5}%`,
      zIndex: 20,
    };
  };

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
    
    const hidden = events.filter(event => {
      if (event.allDay) return false;
      
      const eventStartHour = event.startDate.getHours();
      const eventStartMinute = event.startDate.getMinutes();
      const eventEndHour = event.endDate.getHours();
      const eventEndMinute = event.endDate.getMinutes();
      
      const eventStart = eventStartHour + (eventStartMinute / MINUTES_PER_HOUR);
      const eventEnd = eventEndHour + (eventEndMinute / MINUTES_PER_HOUR);
      
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
    <ResponsiveContainer fullWidth noGutters className="space-y-4">
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
          <div className={cn("p-2 text-sm font-medium bg-muted/30 text-center", 
            isMobile ? "text-[0.8rem]" : "")}
            style={{minWidth: "5rem"}}
          >
            All Day
          </div>
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
                    style={{ backgroundColor: event.color || '#4285F4' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEvent(event);
                    }}
                  >
                    <span className="text-white truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-8 divide-x border-b">
          <div className={cn("py-2 px-1 text-sm font-medium bg-muted/30 text-center", 
            isMobile ? "text-[0.8rem]" : "")}
            style={{minWidth: "5rem"}}
          >
            Time / Day
          </div>
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
          <div className="grid grid-cols-8 divide-x">
            <div className="bg-muted/10" style={{minWidth: "5rem"}}>
              {hours.map((hour, i) => (
                <div key={`hour-${i}`} className="border-b h-[60px] px-2 py-1 text-right text-sm text-muted-foreground">
                  {hour}:00
                </div>
              ))}
            </div>
            
            {daysInWeek.map((day, dayIndex) => (
              <div key={`day-${dayIndex}`} className="relative">
                {hours.map((_, hourIndex) => (
                  <div 
                    key={`${dayIndex}-${hourIndex}`} 
                    className="border-b h-[60px]"
                  />
                ))}
                {eventGroups.map((group, groupIndex) => (
                  <React.Fragment key={`group-${dayIndex}-${groupIndex}`}>
                    {group.map((event, eventIndex) => (
                      <div 
                        key={`multi-${event.id}-${dayIndex}`} 
                        className="absolute text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation pointer-events-auto" 
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default WeekView;
