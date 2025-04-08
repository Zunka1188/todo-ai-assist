
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

  return (
    <ResponsiveContainer fullWidth noGutters className="space-y-2">
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
        <div className="grid grid-cols-[3.5rem_1fr] bg-muted/30 p-2 border-b">
          <div className="text-xs font-medium">Time</div>
          <div className="text-xs font-medium">Events</div>
        </div>
        
        <div className={`h-[calc(100vh-350px)] ${isMobile ? 'overflow-auto' : ''}`}>
          <TimeGrid
            events={events}
            date={date}
            handleViewEvent={handleViewEvent}
            startHour={startHour}
            numHours={numHours}
            gridRef={gridRef}
            processedEvents={processedEvents}
          />
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default DayView;
