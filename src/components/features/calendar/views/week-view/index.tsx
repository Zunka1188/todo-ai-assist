
import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { Event } from '../../types/event';
import { useWeekView } from './useWeekView';
import Navigation from './Navigation';
import TimeControls from './TimeControls';
import WeekHeader from './WeekHeader';
import AllDayEvents from './AllDayEvents';
import TimeGrid from './TimeGrid';

interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
  timeColumnWidth?: number;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1,
  minCellHeight = 60,
  timeColumnWidth = 60
}) => {
  const {
    hours,
    daysInWeek,
    daysEventGroups,
    scrollRef,
    startHour,
    endHour,
    showFullDay,
    startInputValue,
    endInputValue,
    hiddenEvents,
    currentTimePosition,
    scrollContainerHeight,
    weekStart,
    weekEnd,
    prevWeek,
    nextWeek,
    getMultiHourEventStyle,
    handleTimeRangeToggle,
    handleTimeRangeChange,
    handleInputBlur
  } = useWeekView({ date, setDate, events, weekStartsOn, minCellHeight });
  
  return (
    <ResponsiveContainer fullWidth noGutters className="space-y-4">
      <Navigation 
        weekStart={weekStart} 
        weekEnd={weekEnd} 
        prevWeek={prevWeek} 
        nextWeek={nextWeek}
        theme={theme}
      />

      <TimeControls 
        startHour={startHour}
        endHour={endHour}
        showFullDay={showFullDay}
        startInputValue={startInputValue}
        endInputValue={endInputValue}
        hiddenEvents={hiddenEvents}
        handleTimeRangeToggle={handleTimeRangeToggle}
        handleTimeRangeChange={handleTimeRangeChange}
        handleInputBlur={handleInputBlur}
      />
      
      <div className="border rounded-lg overflow-hidden shadow-sm w-full">
        <div className="sticky top-0 z-10 bg-background border-b">
          <WeekHeader daysInWeek={daysInWeek} />
          <AllDayEvents 
            daysInWeek={daysInWeek}
            events={events}
            handleViewEvent={handleViewEvent}
          />
        </div>
        
        <TimeGrid 
          daysInWeek={daysInWeek}
          hours={hours}
          events={daysEventGroups} // Passing Event[][][] type
          handleViewEvent={handleViewEvent}
          scrollRef={scrollRef}
          currentTimePosition={currentTimePosition}
          getMultiHourEventStyle={getMultiHourEventStyle}
          minCellHeight={minCellHeight}
          scrollContainerHeight={scrollContainerHeight}
        />
      </div>
    </ResponsiveContainer>
  );
};

export default WeekView;
