
import React from 'react';
import { Event } from '@/components/features/calendar/types/event';
import EventItem from './EventItem';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  handleEventClick: (event: Event) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, handleEventClick }) => {
  return (
    <div className="space-y-1">
      {events.slice(0, 3).map((event) => (
        <EventItem 
          key={event.id} 
          event={event} 
          onClick={handleEventClick} 
        />
      ))}
      {events.length > 3 && (
        <div className="text-center text-xs text-muted-foreground pt-1">
          +{events.length - 3} more events
        </div>
      )}
      
      <div className="flex items-center justify-end mt-2">
        <Link to="/calendar">
          <Button variant="ghost" size="sm" className="gap-1">
            View Calendar <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventsList;
