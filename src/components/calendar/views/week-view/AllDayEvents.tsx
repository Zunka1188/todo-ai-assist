
import React, { FC } from 'react';
import { CalendarEvent } from '../../types';

interface AllDayEventsProps {
  daysInWeek: Date[];
  events: CalendarEvent[];
  handleViewEvent: (event: CalendarEvent) => void;
}

export const AllDayEvents: FC<AllDayEventsProps> = ({ daysInWeek, events, handleViewEvent }) => {
  return (
    <div className="all-day-events">
      {/* All day events rendering logic here */}
      <div className="grid grid-cols-7 gap-1">
        {events.map(event => (
          <div 
            key={event.id} 
            className="bg-blue-500 text-white p-1 rounded cursor-pointer"
            onClick={() => handleViewEvent(event)}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};
