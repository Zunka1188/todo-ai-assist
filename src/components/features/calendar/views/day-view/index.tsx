
import React, { useRef, useEffect, useState, useMemo } from 'react';
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
  maxTime?: string;
  minTime?: string;
  hideEmptyRows?: boolean;
  constrainEvents?: boolean;
  disablePopups?: boolean;
  scrollable?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollDuration?: number;
}

type DOMEvent = globalThis.Event;

interface CalendarViewEvent extends CustomEvent<Event> {
  detail: Event;
}

const constrainEventsToMaxTime = (events: Event[], maxTimeStr: string): Event[] => {
  const [hours, minutes] = maxTimeStr.split(':').map(Number);
  const maxTime = new Date();
  maxTime.setHours(hours || 23, minutes || 0, 0, 0);
  
  return events.map(event => {
    const newEvent = { ...event };
    
    if (newEvent.endDate.getHours() > maxTime.getHours() || 
        (newEvent.endDate.getHours() === maxTime.getHours() && 
         newEvent.endDate.getMinutes() > maxTime.getMinutes())) {
      
      const constrainedEnd = new Date(newEvent.endDate);
      constrainedEnd.setHours(maxTime.getHours(), maxTime.getMinutes(), 0, 0);
      newEvent.endDate = constrainedEnd;
    }
    
    return newEvent;
  });
};

const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  handleViewEvent,
  theme,
  minCellHeight = 60,
  timeColumnWidth = 60,
  maxTime = "23:00",
  minTime = "00:00",
  hideEmptyRows = false,
  constrainEvents = false,
  disablePopups = true,
  scrollable = true,
  scrollBehavior = 'smooth',
  scrollDuration = 300
}) => {
  const { isMobile } = useIsMobile();
  const gridRef = useRef<HTMLDivElement>(null);
  const { enabled: debugEnabled, logProps } = useDebugMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
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
  
  const processedEvents = useMemo(() => {
    return constrainEvents 
      ? constrainEventsToMaxTime(events, maxTime)
      : events;
  }, [events, constrainEvents, maxTime]);
  
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
    processedEventsGroups,
  } = useEventManagement(processedEvents, date);

  const prevDay = () => {
    window.dispatchEvent(new CustomEvent('calendar-navigate', { 
      detail: { direction: 'prev', view: 'day', date: subDays(date, 1) } 
    }));
  };
  
  const nextDay = () => {
    window.dispatchEvent(new CustomEvent('calendar-navigate', { 
      detail: { direction: 'next', view: 'day', date: addDays(date, 1) } 
    }));
  };

  const numHours = showAllHours ? 24 : (endHour - startHour + 1);
  
  const scrollContainerHeight = isMobile 
    ? 'calc(100vh - 320px)' 
    : 'calc(100vh - 300px)';
    
  useEffect(() => {
    if (disablePopups) return;
      
    const handleViewEventClick = (e: DOMEvent) => {
      const customEvent = e as unknown as CustomEvent<Event>;
      if (customEvent.detail) {
        handleViewEvent(customEvent.detail);
      }
    };
    
    window.addEventListener('view-event', handleViewEventClick as unknown as EventListener);
    
    return () => {
      window.removeEventListener('view-event', handleViewEventClick as unknown as EventListener);
    };
  }, [handleViewEvent, disablePopups]);

  const getCurrentTimePosition = () => {
    if (!isSameDay(currentTime, date)) return -1;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < startHour || currentHour > endHour) return -1;
    
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
        handleViewEvent={disablePopups ? () => {} : handleViewEvent}
      />
      
      <div className="border rounded-lg overflow-hidden w-full shadow-sm">
        <div className="grid grid-cols-[3.5rem_1fr] bg-background p-2 border-b sticky top-0 z-20">
          <div className="text-xs font-medium border-r text-muted-foreground">Time</div>
          <div className="text-xs font-medium pl-2">Events</div>
        </div>
        
        <ScrollArea 
          className="overflow-auto" 
          style={{ height: scrollContainerHeight, position: 'relative' }}
          scrollRef={gridRef}
        >
          <div className="relative">
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
                    className="border-t hover:bg-accent/5 transition-colors"
                    style={{ height: `${minCellHeight}px` }}
                  />
                </React.Fragment>
              ))}
            </div>
            
            {currentTimePosition > 0 && (
              <div 
                className="absolute left-0 right-0 flex items-center z-30 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="h-3 w-3 rounded-full bg-red-500 ml-2 shadow-sm"></div>
                <div className="flex-1 h-[2px] bg-red-500"></div>
              </div>
            )}
            
            <div className="absolute inset-0 pointer-events-none">
              {processedEventsGroups.map((group, groupIndex) => (
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
                    handleViewEvent={disablePopups ? undefined : handleViewEvent}
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
