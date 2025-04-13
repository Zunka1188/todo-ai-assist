
import React from 'react';
import { cn } from '@/lib/utils';
import { isSameDay, isToday, isWeekend } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";
import { Event } from '../../../calendar/types/event';

interface AllDayEventsProps {
  daysInWeek: Date[];
  events: Event[];
  handleViewEvent: (event: Event) => void;
}

const AllDayEvents: React.FC<AllDayEventsProps> = ({
  daysInWeek,
  events,
  handleViewEvent
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="all-day-events">
      <div className="grid grid-cols-7 gap-1">
        {events
          .filter(event => event.allDay)
          .map(event => (
            <div 
              key={event.id} 
              className="bg-blue-500 text-white p-1 rounded cursor-pointer"
              onClick={() => handleViewEvent(event)}
            >
              {event.title}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default AllDayEvents;
