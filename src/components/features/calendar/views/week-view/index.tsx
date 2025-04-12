
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { addDays, startOfWeek, eachDayOfInterval, getHours, format, differenceInMinutes, isToday } from 'date-fns';
import { startOfDay, endOfDay } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import TimeGrid from './TimeGrid';
import AllDayEvents from './AllDayEvents';
import WeekHeader from './WeekHeader';
import TimeControls from './TimeControls';
import Navigation from './Navigation';
import { Event } from '../../types/event';
import { useWeekView } from './useWeekView';

interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekends?: boolean;
  minCellHeight?: number;
  timeColumnWidth?: number;
  onUpdateEvent?: (event: Event) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme = 'light',
  weekStartsOn = 1, // Default to Monday
  showWeekends = true,
  minCellHeight = 60,
  timeColumnWidth = 60,
  onUpdateEvent
}) => {
  const {
    scrollRef,
    daysInWeek,
    hours,
    eventGroups,
    allDayEvents,
    currentTimePosition,
    prevWeek,
    nextWeek,
    todayColumn,
    goToToday,
    getMultiHourEventStyle,
    horizontalScrollRef
  } = useWeekView({
    date,
    setDate,
    events,
    weekStartsOn,
    showWeekends,
    minCellHeight
  });

  // Calculate container height to make it responsive
  const mainHeight = "calc(100vh - 280px)";
  
  const { isMobile } = useIsMobile();
  
  return (
    <div className="flex flex-col space-y-2 h-full">
      {/* We'll put the navigation controls in CalendarHeader instead */}
      
      <div className="flex flex-col h-full">
        <div 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" 
          ref={horizontalScrollRef}
        >
          {/* Week days header */}
          <WeekHeader 
            daysInWeek={daysInWeek} 
            todayColumnIndex={todayColumn} 
          />

          {/* All day events */}
          <AllDayEvents 
            daysInWeek={daysInWeek} 
            events={allDayEvents} 
            handleViewEvent={handleViewEvent} 
          />

          {/* Time grid with events */}
          <TimeGrid 
            daysInWeek={daysInWeek} 
            hours={hours} 
            events={eventGroups} 
            handleViewEvent={handleViewEvent} 
            scrollRef={scrollRef} 
            currentTimePosition={currentTimePosition} 
            getMultiHourEventStyle={getMultiHourEventStyle}
            minCellHeight={minCellHeight}
            scrollContainerHeight={isMobile ? "calc(100vh - 280px)" : mainHeight}
            onEventUpdate={onUpdateEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default WeekView;
