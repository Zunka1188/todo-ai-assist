
import React, { useRef, useEffect, useState } from 'react';
import { addDays, subDays, isSameDay, format } from 'date-fns';
import { Event } from '../../types/event';
import DayHeader from './DayHeader';
import TimeRange from './TimeRange';
import AllDayEvents from './AllDayEvents';
import TimeGrid from './TimeGrid';
import { useEventManagement } from './useEventManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebugMode } from '@/hooks/useDebugMode';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import CalendarEventItem from '../../ui/CalendarEventItem';

interface DayViewProps {
  date: Date;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  minCellHeight?: number;
  timeColumnWidth?: number;
}

// Define custom event interface to fix type errors
interface CalendarViewEventDetail {
  detail: Event;
}

// Custom event type
type CalendarViewEvent = CustomEvent<Event>;

const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  handleViewEvent,
  theme,
  minCellHeight = 60,
  timeColumnWidth = 60
}) => {
  const { isMobile } = useIsMobile();
  const gridRef = useRef<HTMLDivElement>(null);
  const { enabled: debugEnabled, logProps } = useDebugMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time for the time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Debug component props
  useEffect(() => {
    logProps('DayView', { date, events: events?.length });
    
    if (debugEnabled) {
      console.group('DayView - Component Mount/Update');
      console.log('Date:', date);
      console.log('Events Count:', events?.length);
      console.log('Theme:', theme);
      console.log('Mobile:', isMobile);
      console.groupEnd();
    }
  }, [date, events, theme, isMobile, debugEnabled, logProps]);
  
  // Use custom hook for event management
  const {
    startHour,
    endHour,
    startInputValue,
    endInputValue,
    showAllHours,
    hiddenEvents,
    hours,
    allDayEvents,
    handleTimeRangeToggle,
    handleTimeRangeChange,
    handleInputBlur,
    processedEvents,
  } = useEventManagement(events, date);

  const prevDay = () => {
    // Using a custom event to bubble up navigation
    window.dispatchEvent(new CustomEvent('calendar-navigate', { 
      detail: { direction: 'prev', view: 'day', date: subDays(date, 1) } 
    }));
  };
  
  const nextDay = () => {
    window.dispatchEvent(new CustomEvent('calendar-navigate', { 
      detail: { direction: 'next', view: 'day', date: addDays(date, 1) } 
    }));
  };

  // Calculate the number of hours to display
  const numHours = showAllHours ? 24 : (endHour - startHour + 1);
  
  // Calculate the appropriate height for the scroll container
  const scrollContainerHeight = isMobile 
    ? 'calc(100vh - 320px)' 
    : 'calc(100vh - 300px)';
    
  // Handle event view clicks with proper typing
  useEffect(() => {
    const handleViewEventClick = (e: CustomEvent<Event>) => {
      if (e.detail) {
        handleViewEvent(e.detail);
      }
    };
    
    // Use 'any' to bypass type checking for the custom event
    window.addEventListener('view-event', handleViewEventClick as any);
    
    return () => {
      window.removeEventListener('view-event', handleViewEventClick as any);
    };
  }, [handleViewEvent]);

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    if (!isSameDay(currentTime, date)) return -1;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if current time is within the visible range
    if (currentHour < startHour || currentHour > endHour) return -1;
    
    // Calculate position
    return (currentHour - startHour) * minCellHeight + (currentMinute / 60) * minCellHeight;
  };
  
  const currentTimePosition = getCurrentTimePosition();

  return (
    <ResponsiveContainer fullWidth noGutters mobileFullWidth className="space-y-2">
      <DayHeader 
        date={date}
        theme={theme}
        prevDay={prevDay}
        nextDay={nextDay}
      />
      
      <TimeRange
        startHour={startHour}
        endHour={endHour}
        startInputValue={startInputValue}
        endInputValue={endInputValue}
        showAllHours={showAllHours}
        hiddenEvents={hiddenEvents}
        handleTimeRangeToggle={handleTimeRangeToggle}
        handleTimeRangeChange={handleTimeRangeChange}
        handleInputBlur={handleInputBlur}
      />
      
      <AllDayEvents 
        allDayEvents={allDayEvents}
        handleViewEvent={handleViewEvent}
      />
      
      <div className="border rounded-lg overflow-hidden w-full">
        {/* Fixed headers with sticky positioning - improved z-index and styling */}
        <div className="grid grid-cols-[3.5rem_1fr] bg-background p-2 border-b sticky top-0 z-20">
          <div className="text-xs font-medium border-r">Time</div>
          <div className="text-xs font-medium pl-2">Events</div>
        </div>
        
        {/* Scrollable time grid with proper height and scroll behavior */}
        <ScrollArea 
          className="overflow-auto" 
          style={{ height: scrollContainerHeight, position: 'relative' }}
          scrollRef={gridRef}
        >
          <div className="relative">
            {/* Hour grid */}
            <div className="grid grid-cols-[3.5rem_1fr]">
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  <div 
                    className="border-t text-xs text-right pr-2 pt-1 text-muted-foreground border-r"
                    style={{ height: `${minCellHeight}px` }}
                  >
                    {format(new Date().setHours(hour), 'h a')}
                  </div>
                  <div 
                    className="border-t"
                    style={{ height: `${minCellHeight}px` }}
                  />
                </React.Fragment>
              ))}
            </div>
            
            {/* Current time indicator */}
            {currentTimePosition > 0 && (
              <div 
                className="absolute left-0 right-0 flex items-center z-30 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="h-3 w-3 rounded-full bg-red-500 ml-2"></div>
                <div className="flex-1 h-[2px] bg-red-500"></div>
              </div>
            )}
            
            {/* Events */}
            <div className="absolute inset-0 pointer-events-none">
              {processedEvents.map((group, groupIndex) => (
                group.events.map((event, eventIndex) => (
                  <CalendarEventItem
                    key={event.id}
                    event={event}
                    viewType="day"
                    date={date}
                    cellHeight={minCellHeight}
                    timeColumnWidth={timeColumnWidth}
                    position={eventIndex}
                    totalOverlapping={group.maxOverlap}
                  />
                ))
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </ResponsiveContainer>
  );
};

export default DayView;
