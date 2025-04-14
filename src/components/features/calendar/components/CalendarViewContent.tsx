
import React from 'react';
import { format } from 'date-fns';
import ErrorBoundary from '../ErrorBoundary';
import MonthView from '../views/MonthView';
import WeekView from '../views/week-view/index';
import DayView from '../views/day-view';
import AgendaView from '../views/AgendaView';
import { Event } from '../types/event';

interface CalendarViewContentProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
  filteredEvents: Event[];
  handleViewEvent: (event: Event) => void;
  handleSetDate: (date: Date) => void;
  theme: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dimensions: {
    minCellHeight: number;
    headerHeight: number;
    timeWidth: number;
  };
  isFileUploaderOpen: boolean;
}

const CalendarViewContent: React.FC<CalendarViewContentProps> = ({
  viewMode,
  date,
  filteredEvents,
  handleViewEvent,
  handleSetDate,
  theme,
  weekStartsOn,
  dimensions,
  isFileUploaderOpen
}) => {
  if (isFileUploaderOpen) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {viewMode === 'month' && (
          <MonthView
            date={date}
            setDate={handleSetDate}
            events={filteredEvents}
            handleViewEvent={handleViewEvent}
            theme={theme}
            weekStartsOn={weekStartsOn}
            minCellHeight={dimensions.minCellHeight}
          />
        )}
        
        {viewMode === 'week' && (
          <WeekView
            date={date}
            setDate={handleSetDate}
            events={filteredEvents}
            handleViewEvent={handleViewEvent}
            theme={theme}
            weekStartsOn={weekStartsOn}
            minCellHeight={dimensions.minCellHeight}
            timeColumnWidth={dimensions.timeWidth}
          />
        )}
        
        {viewMode === 'day' && (
          <DayView
            date={date}
            events={filteredEvents}
            handleViewEvent={handleViewEvent}
            theme={theme}
            minCellHeight={dimensions.minCellHeight}
            timeColumnWidth={dimensions.timeWidth}
          />
        )}
        
        {viewMode === 'agenda' && (
          <AgendaView
            date={date}
            setDate={handleSetDate}
            events={filteredEvents}
            handleViewEvent={handleViewEvent}
            theme={theme}
            itemHeight={dimensions.minCellHeight}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CalendarViewContent;
