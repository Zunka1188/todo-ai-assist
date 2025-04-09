
import React, { useRef, useEffect } from 'react';
import { addDays, subDays } from 'date-fns';
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
  const { isMobile } = useIsMobile();
  const gridRef = useRef<HTMLDivElement>(null);
  const { enabled: debugEnabled, logProps } = useDebugMode();
  
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

  // Debug data flow
  useEffect(() => {
    if (debugEnabled) {
      console.group('DayView - Processed Data');
      console.log('Events:', events);
      console.log('All Day Events:', allDayEvents?.length);
      console.log('Processed Events:', processedEvents);
      console.log('Time Range:', `${startHour}:00-${endHour}:00`);
      console.log('Hidden Events:', hiddenEvents?.length);
      console.groupEnd();
    }
  }, [events, allDayEvents, processedEvents, startHour, endHour, hiddenEvents, debugEnabled]);

  const prevDay = () => {
    setDate(subDays(date, 1));
  };
  
  const nextDay = () => {
    setDate(addDays(date, 1));
  };

  // Calculate the number of hours to display
  const numHours = showAllHours ? 24 : (endHour - startHour + 1);
  
  // Calculate the appropriate height for the scroll container
  const scrollContainerHeight = isMobile 
    ? 'calc(100vh - 320px)' 
    : 'calc(100vh - 300px)';

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
          <TimeGrid
            events={events}
            date={date}
            handleViewEvent={handleViewEvent}
            startHour={startHour}
            numHours={numHours}
            gridRef={gridRef}
            processedEvents={processedEvents}
          />
        </ScrollArea>
      </div>
    </ResponsiveContainer>
  );
};

export default DayView;
