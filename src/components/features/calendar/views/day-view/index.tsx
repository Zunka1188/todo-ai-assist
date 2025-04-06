
import React from 'react';
import { addDays, subDays } from 'date-fns';
import { Event } from '../../types/event';
import DayHeader from './DayHeader';
import TimeRange from './TimeRange';
import AllDayEvents from './AllDayEvents';
import TimeGrid from './TimeGrid';
import { useEventManagement } from './useEventManagement';
import { useIsMobile } from '@/hooks/use-mobile';

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
    eventGroups,
    handleTimeRangeToggle,
    handleTimeRangeChange,
    handleInputBlur,
  } = useEventManagement(events, date);

  const prevDay = () => {
    setDate(subDays(date, 1));
  };
  
  const nextDay = () => {
    setDate(addDays(date, 1));
  };

  return (
    <div className="space-y-3 mx-auto w-full">
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
        
        <TimeGrid
          hours={hours}
          date={date}
          eventGroups={eventGroups}
          startHour={startHour}
          handleViewEvent={handleViewEvent}
        />
      </div>
    </div>
  );
};

export default DayView;
