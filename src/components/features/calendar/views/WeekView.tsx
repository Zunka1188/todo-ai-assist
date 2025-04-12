import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, isSameMonth, isSameDay, isToday, isWeekend } from 'date-fns';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeRangeConfig {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  step: number;
  showAllDay: boolean;
}

interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
  timeColumnWidth?: number;
  maxTime?: string;
  minTime?: string;
  hideEmptyRows?: boolean;
  deduplicateAllDay?: boolean;
  constrainEvents?: boolean;
  disablePopups?: boolean;
  scrollable?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollDuration?: number;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1,
  minCellHeight = 60,
  timeColumnWidth = 60,
  maxTime = "23:59",
  minTime = "00:00",
  hideEmptyRows = true,
  deduplicateAllDay = true,
  constrainEvents = true,
  disablePopups = false,
  scrollable = true,
  scrollBehavior = 'smooth',
  scrollDuration = 300
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLElement>(null);
  const [timeRangeConfig, setTimeRangeConfig] = useState<TimeRangeConfig>({
    startHour: 0,
    startMinute: 0,
    endHour: 23,
    endMinute: 59,
    step: 30,
    showAllDay: true
  });
  const [showFullDay, setShowFullDay] = useState(true);
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Parse min/max time strings
  useEffect(() => {
    const parseTimeString = (timeStr: string): { hour: number, minute: number } => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { hour: hours || 0, minute: minutes || 0 };
    };
    
    const startTime = parseTimeString(minTime);
    const endTime = parseTimeString(maxTime);
    
    setTimeRangeConfig(prev => ({
      ...prev,
      startHour: startTime.hour,
      startMinute: startTime.minute,
      endHour: endTime.hour,
      endMinute: endTime.minute
    }));
    
    setStartInputValue(startTime.hour.toString());
    setEndInputValue(endTime.hour.toString());
    setShowFullDay(startTime.hour === 0 && endTime.hour >= 23);
  }, [minTime, maxTime]);
  
  // Update current time for the time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Scroll to current time on initial render
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only scroll if current time is within view range
      if (currentHour >= timeRangeConfig.startHour && 
          (currentHour < timeRangeConfig.endHour || 
          (currentHour === timeRangeConfig.endHour && currentMinute <= timeRangeConfig.endMinute))) {
        
        const hoursOffset = currentHour - timeRangeConfig.startHour;
        const minutesOffset = currentMinute / 60;
        const scrollPosition = (hoursOffset + minutesOffset) * minCellHeight;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ 
              top: scrollPosition - 100, 
              behavior: scrollBehavior 
            });
          }
        }, 300);
      }
    }
  }, [timeRangeConfig, minCellHeight, scrollBehavior]);

  const HOUR_HEIGHT = minCellHeight;
  const MINUTES_PER_HOUR = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / MINUTES_PER_HOUR;
  const TIME_COLUMN_WIDTH = timeColumnWidth;
  const DAY_COLUMN_WIDTH = (100 - TIME_COLUMN_WIDTH) / 7;

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

  // Calculate visible hours based on timeRangeConfig
  const hours = Array.from({
    length: timeRangeConfig.endHour - timeRangeConfig.startHour + 1
  }, (_, i) => timeRangeConfig.startHour + i);

  // Check if an event is visible within the current time range
  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    
    const eventStartHour = event.startDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndHour = event.endDate.getHours();
    const eventEndMinute = event.endDate.getMinutes();
    
    const eventStart = eventStartHour + (eventStartMinute / MINUTES_PER_HOUR);
    const eventEnd = eventEndHour + (eventEndMinute / MINUTES_PER_HOUR);
    
    // Check if the event falls within the visible time range
    const configEnd = timeRangeConfig.endHour + (timeRangeConfig.endMinute / MINUTES_PER_HOUR);
    const configStart = timeRangeConfig.startHour + (timeRangeConfig.startMinute / MINUTES_PER_HOUR);
    
    return (eventStart <= configEnd && eventEnd >= configStart);
  };

  // Filter out events that are not visible
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

  // Get multi-hour events for a specific day
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

  // Get style for multi-hour events
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
    
    // Ensure event is within visible time range
    const configStart = timeRangeConfig.startHour + (timeRangeConfig.startMinute / MINUTES_PER_HOUR);
    const configEnd = timeRangeConfig.endHour + (timeRangeConfig.endMinute / MINUTES_PER_HOUR);
    
    const visibleStartHourDecimal = Math.max(startHourDecimal, configStart);
    const visibleEndHourDecimal = Math.min(endHourDecimal, configEnd);
    
    // Calculate position based on visible time range
    const topPosition = (visibleStartHourDecimal - timeRangeConfig.startHour) * HOUR_HEIGHT;
    const heightValue = Math.max((visibleEndHourDecimal - visibleStartHourDecimal) * HOUR_HEIGHT, 20);
    
    const dayColumnIndex = daysInWeek.findIndex(d => isSameDay(d, day));
    
    let eventWidth;
    let leftOffset;
    
    if (isMobile) {
      eventWidth = totalOverlapping > 1 ? 90 : 90; 
      leftOffset = TIME_COLUMN_WIDTH + (dayColumnIndex * DAY_COLUMN_WIDTH) + 1;
    } else {
      const maxSideEvents = Math.min(totalOverlapping, 3);
      eventWidth = (DAY_COLUMN_WIDTH / maxSideEvents) - 0.5;
      
      const adjustedIndex = index % maxSideEvents;
      leftOffset = TIME_COLUMN_WIDTH + (dayColumnIndex * DAY_COLUMN_WIDTH) + (adjustedIndex * (eventWidth));
    }
    
    return {
      position: 'absolute' as const,
      top: `${topPosition}px`,
      height: `${heightValue}px`, 
      left: `${leftOffset}%`,
      width: `${eventWidth}%`,
      minWidth: isMobile ? '80%' : '80px',
      zIndex: 20,
      backgroundColor: event.color || '#4285F4',
      opacity: 0.95,
      transition: `all ${scrollDuration}ms ease-in-out`
    };
  };

  // Get visible event groups for a specific day
  const getVisibleMultiHourEventGroups = (day: Date): Event[][] => {
    const dayEvents = getMultiHourEventsForDay(day);
    return groupOverlappingEvents(dayEvents);
  };

  const daysEventGroups = daysInWeek.map(day => {
    return getVisibleMultiHourEventGroups(day);
  });

  // Handle time range preset changes
  const handleTimeRangeToggle = (preset: string) => {
    switch (preset) {
      case 'full':
        setTimeRangeConfig({
          ...timeRangeConfig,
          startHour: 0,
          startMinute: 0,
          endHour: 23,
          endMinute: 59,
          showAllDay: true
        });
        setStartInputValue("0");
        setEndInputValue("23");
        setShowFullDay(true);
        break;
      case 'business':
        setTimeRangeConfig({
          ...timeRangeConfig,
          startHour: 8,
          startMinute: 0,
          endHour: 18,
          endMinute: 0,
          showAllDay: true
        });
        setStartInputValue("8");
        setEndInputValue("18");
        setShowFullDay(false);
        break;
      case 'evening':
        setTimeRangeConfig({
          ...timeRangeConfig,
          startHour: 17,
          startMinute: 0,
          endHour: 23,
          endMinute: 59,
          showAllDay: true
        });
        setStartInputValue("17");
        setEndInputValue("23");
        setShowFullDay(false);
        break;
      case 'morning':
        setTimeRangeConfig({
          ...timeRangeConfig,
          startHour: 4,
          startMinute: 0,
          endHour: 12,
          endMinute: 0,
          showAllDay: true
        });
        setStartInputValue("4");
        setEndInputValue("12");
        setShowFullDay(false);
        break;
      case 'custom':
        // Custom time range - maintain current settings
        setShowFullDay(
          timeRangeConfig.startHour === 0 && 
          timeRangeConfig.startMinute === 0 && 
          timeRangeConfig.endHour === 23 && 
          timeRangeConfig.endMinute >= 30
        );
        break;
    }
  };

  // Handle time range input changes
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
    
    let newStart = timeRangeConfig.startHour;
    let newEnd = timeRangeConfig.endHour;
    
    if (type === 'start') {
      if (hour <= timeRangeConfig.endHour) newStart = hour;
    } else {
      if (hour >= timeRangeConfig.startHour) newEnd = hour;
    }
    
    const newTimeConfig = {
      ...timeRangeConfig,
      startHour: type === 'start' ? newStart : timeRangeConfig.startHour,
      endHour: type === 'end' ? newEnd : timeRangeConfig.endHour
    };
    
    setTimeRangeConfig(newTimeConfig);
    setShowFullDay(newStart === 0 && newEnd === 23);
    
    // Revalidate if any events are now hidden
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
      // Consider showing a warning toast
      toast({
        title: `${hidden.length} event${hidden.length > 1 ? 's' : ''} hidden`,
        description: "Some events are outside the selected time range",
        variant: "warning",
        duration: 3000
      });
    }
  };

  // Handle input blur to validate final values
  const handleInputBlur = (type: 'start' | 'end') => {
    if (type === 'start') {
      const value = startInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setStartInputValue(timeRangeConfig.startHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour > timeRangeConfig.endHour) {
        setStartInputValue(timeRangeConfig.startHour.toString());
      } else {
        setTimeRangeConfig({
          ...timeRangeConfig,
          startHour: hour,
          startMinute: 0
        });
        setStartInputValue(hour.toString());
      }
    } else {
      const value = endInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setEndInputValue(timeRangeConfig.endHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour < timeRangeConfig.startHour) {
        setEndInputValue(timeRangeConfig.endHour.toString());
      } else {
        setTimeRangeConfig({
          ...timeRangeConfig,
          endHour: hour,
          endMinute: hour === 23 ? 59 : 0
        });
        setEndInputValue(hour.toString());
      }
    }
    
    setShowFullDay(
      timeRangeConfig.startHour === 0 && 
      timeRangeConfig.endHour === 23 && 
      timeRangeConfig.endMinute >= 30
    );
  };

  // Calculate current time indicator position
  const currentTime = new Date();
  
  const getCurrentTimePosition = useCallback(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if current time is within the visible range
    const configStart = timeRangeConfig.startHour + (timeRangeConfig.startMinute / MINUTES_PER_HOUR);
    const configEnd = timeRangeConfig.endHour + (timeRangeConfig.endMinute / MINUTES_PER_HOUR);
    const currentTimeValue = currentHour + (currentMinute / 60);
    
    if (currentTimeValue < configStart || currentTimeValue > configEnd) return -1;
    
    // Calculate position
    return (currentHour - timeRangeConfig.startHour) * minCellHeight + (currentMinute / 60) * minCellHeight;
  }, [currentTime, timeRangeConfig, minCellHeight]);
  
  const currentTimePosition = getCurrentTimePosition();

  // Handle auto scroll on window resize
  useEffect(() => {
    const handleResize = () => {
      if (currentTimePosition > 0 && scrollRef.current) {
        scrollRef.current.scrollTop = currentTimePosition - 150;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTimePosition]);
  
  // Custom scroll handler for accessibility
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Implement custom scroll behavior if needed
    // For example, snap to hours or detect when near the top/bottom
  };
  
  // Calculate scroll container height - fixed to prevent unbounded scrolling
  const scrollContainerHeight = isMobile 
    ? 'calc(100vh - 320px)' 
    : 'calc(100vh - 300px)';

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
            className="bg-transparent data-[state=on]:bg-purple-600 data-[state=on]:text-primary-foreground tap-target"
          >
            Full 24h
          </Toggle>
          <Toggle
            pressed={timeRangeConfig.startHour === 8 && timeRangeConfig.endHour === 18}
            onPressedChange={() => handleTimeRangeToggle('business')}
            className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
          >
            Business hours
          </Toggle>
          <Toggle
            pressed={timeRangeConfig.startHour === 17 && timeRangeConfig.endHour === 23}
            onPressedChange={() => handleTimeRangeToggle('evening')}
            className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
          >
            Evening
          </Toggle>
          <Toggle
            pressed={timeRangeConfig.startHour === 4 && timeRangeConfig.endHour === 12}
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
                aria-label="Start hour"
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
                aria-label="End hour"
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
              Warning: {hiddenEvents.length} event{hiddenEvents.length === 1 ? '' : 's'} {hiddenEvents.length > 1 ? 'are' : 'is'} outside the selected time range and {hiddenEvents.length > 1 ? 'are' : 'is'} not visible.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden shadow-sm w-full">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="grid grid-cols-8 divide-x border-gray-800">
            <div className={cn("p-2 text-sm font-medium bg-muted/30 text-center", 
              isMobile ? "text-[0.8rem]" : "")}
              style={{minWidth: "5rem"}}
            >
              Time
            </div>
            {daysInWeek.map((day, index) => {
              const isCurrentDate = isToday(day);
              const isWeekendDay = isWeekend(day);
              return (
                <div 
                  key={index} 
                  className={cn(
                    "p-2 text-center", 
                    isCurrentDate && "bg-accent/30",
                    isWeekendDay && "bg-muted/10"
                  )}
                >
                  <div className={cn("font-medium", isMobile ? "text-[0.8rem]" : "")}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-sm", 
                    isCurrentDate ? "text-primary font-semibold" : "text-muted-foreground",
                    isWeekendDay && !isCurrentDate && "text-purple-300 dark:text-purple-300",
                    isMobile ? "text-[0.8rem]" : ""
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day events section - just ONE row that doesn't duplicate */}
          <div className="grid grid-cols-8 divide-x border-gray-800">
            <div className={cn("p-2 text-sm font-medium bg-muted/30 text-center", 
              isMobile ? "text-[0.8rem]" : "")}
              style={{minWidth: "5rem"}}
            >
              All Day
            </div>
            {daysInWeek.map((day, index) => {
              const allDayEvents = getEventsForDay(day).filter(event => event.allDay);
              const isCurrentDate = isToday(day);
              const isWeekendDay = isWeekend(day);
              return (
                <div 
                  key={index} 
                  className={cn(
                    "p-1 min-h-[40px]", 
                    isCurrentDate && "bg-accent/30",
                    isWeekendDay && "bg-muted/10"
                  )}
                >
                  {allDayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation calendar-event" 
                      style={{ backgroundColor: event.color || '#4285F4' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                      data-event-id={event.id}
                      role="button"
                      aria-label={`All-day event: ${event.title}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewEvent(event);
                        }
                      }}
                    >
                      <span className="text-white truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        
        <ScrollArea 
          className={cn(
            "overflow-auto calendar-scroll-container",
            scrollable ? "" : "overflow-hidden" 
          )}
          style={{ height: scrollContainerHeight, position: 'relative' }}
          scrollRef={scrollRef as any}
          onScrollCapture={handleScroll}
          ref={scrollAreaRef as any}
        >
          <div className="relative" style={{ minHeight: minCellHeight * hours.length }}>
            <div className="grid grid-cols-8 divide-x border-gray-800">
              <div className="sticky left-0 z-10 border-r border-gray-800" style={{minWidth: "5rem"}}>
                {hours.map((hour, i) => (
                  <div key={`hour-${i}`} className="border-b h-[60px] px-2 py-1 text-right text-xs text-muted-foreground">
                    {format(new Date().setHours(hour), 'h a')}
                  </div>
                ))}
              </div>
              
              {daysInWeek.map((day, dayIndex) => (
                <div key={`day-${dayIndex}`} className={cn(
                  "relative",
                  isToday(day) ? "bg-accent/10" : "",
                  isWeekend(day) ? "bg-muted/5" : ""
                )}>
                  {hours.map((_, hourIndex) => (
                    <div 
                      key={`${dayIndex}-${hourIndex}`} 
                      className="border-b h-[60px] relative"
                    >
                      {/* Half-hour gridlines - more subtle */}
                      <div className="absolute top-1/2 left-0 right-0 border-t border-gray-800 border-opacity-50"></div>
                      
                      {/* Quarter-hour gridlines - even more subtle */}
                      <div className="absolute top-1/4 left-0 right-0 border-t border-gray-800 border-opacity-30"></div>
                      <div className="absolute top-3/4 left-0 right-0 border-t border-gray-800 border-opacity-30"></div>
                    </div>
                  ))}
                  
                  {/* Current time indicator for today's column */}
                  {isToday(day) && currentTimePosition > 0 && (
                    <div 
                      className="absolute left-0 right-0 flex items-center z-30 pointer-events-none"
                      style={{ 
                        top: `${currentTimePosition}px`,
                        transition: `top ${scrollDuration}ms ease-in-out`
                      }}
                    >
                      <div className="h-2 w-2 rounded-full bg-red-500 ml-2"></div>
                      <div className="flex-1 h-[2px] bg-red-500"></div>
                    </div>
                  )}
                  
                  {/* Event cards */}
                  {daysEventGroups[dayIndex].map((group, groupIndex) => (
                    <div key={`group-${dayIndex}-${groupIndex}`} className="relative">
                      {group.map((event, eventIndex) => (
                        <div 
                          key={`multi-${event.id}-${dayIndex}`} 
                          className={cn(
                            "absolute text-xs p-2 rounded cursor-pointer hover:opacity-80 touch-manipulation pointer-events-auto calendar-event",
                            isMobile ? "left-0 right-0 mx-1" : "",
                            "shadow-sm"
                          )}
                          style={getMultiHourEventStyle(event, day, group.length, eventIndex)}
                          onClick={() => handleViewEvent(event)}
                          data-event-id={event.id}
                          role="button"
                          aria-label={`Event: ${event.title} from ${getFormattedTime(event.startDate)} to ${getFormattedTime(event.endDate)}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleViewEvent(event);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Clock className="h-2.5 w-2.5 mr-1 text-white flex-shrink-0" />
                            <span className="text-white truncate font-medium">{event.title}</span>
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
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </ResponsiveContainer>
  );
};

export default WeekView;
