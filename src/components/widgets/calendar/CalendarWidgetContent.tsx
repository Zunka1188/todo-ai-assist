
import React from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Event } from '@/components/features/calendar/types/event';
import EventsList from './EventsList';

interface CalendarWidgetContentProps {
  isLoading: boolean;
  error: string | null;
  events: Event[];
  handleEventClick: (event: Event) => void;
}

const CalendarWidgetContent: React.FC<CalendarWidgetContentProps> = ({
  isLoading,
  error,
  events,
  handleEventClick
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground p-4">
        {error}
      </div>
    );
  }

  if (events.length > 0) {
    return <EventsList events={events} handleEventClick={handleEventClick} />;
  }

  return (
    <div className="text-center text-muted-foreground py-6">
      <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
      No events scheduled for today
    </div>
  );
};

export default CalendarWidgetContent;
