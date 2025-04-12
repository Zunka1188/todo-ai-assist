
import React from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Event } from '../../types/event';
import { useEventManagement } from './useEventManagement';
import TimeGrid from '../week-view/TimeGrid';
import AllDayEvents from '../week-view/AllDayEvents';
import DayHeader from './DayHeader';

interface DayViewProps {
  date: Date;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme?: string;
  minCellHeight?: number;
  timeColumnWidth?: number;
  onUpdateEvent?: (event: Event) => void;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  handleViewEvent,
  theme = 'light',
  minCellHeight = 60,
  timeColumnWidth = 60,
  onUpdateEvent
}) => {
  const {
    hours,
    daysInView,
    eventGroups,
    allDayEvents,
    prevDay,
    nextDay,
    currentTimePosition,
    scrollRef,
    getMultiHourEventStyle
  } = useEventManagement({
    date,
    events,
    minCellHeight
  });
  
  const { isMobile } = useIsMobile();
  const mainHeight = isMobile ? "calc(100vh - 250px)" : "calc(100vh - 280px)";
  
  return (
    <div className="flex flex-col space-y-2 bg-background">
      {/* Day Navigation Header */}
      <DayHeader 
        date={date}
        theme={theme}
        prevDay={prevDay}
        nextDay={nextDay}
      />
      
      {/* All day events row */}
      <AllDayEvents 
        daysInWeek={daysInView} 
        events={allDayEvents}
        handleViewEvent={handleViewEvent}
      />
      
      {/* Time grid with events */}
      <div className="flex-1">
        <TimeGrid 
          daysInWeek={daysInView}
          hours={hours}
          events={eventGroups}
          handleViewEvent={handleViewEvent}
          scrollRef={scrollRef}
          currentTimePosition={currentTimePosition}
          getMultiHourEventStyle={getMultiHourEventStyle}
          minCellHeight={minCellHeight}
          scrollContainerHeight={mainHeight}
          onEventUpdate={onUpdateEvent}
        />
      </div>
    </div>
  );
};

export default DayView;
