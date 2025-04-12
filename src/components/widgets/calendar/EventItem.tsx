
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Event } from '@/components/features/calendar/types/event';

interface EventItemProps {
  event: Event;
  onClick: (event: Event) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  // Function to get formatted time
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <button
      onClick={() => onClick(event)}
      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted flex items-start"
    >
      <div
        className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0"
        style={{ backgroundColor: event.color || '#4285F4' }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
          {!event.allDay && (
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {getFormattedTime(event.startDate)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default EventItem;
