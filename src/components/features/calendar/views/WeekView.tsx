import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

interface Props {
  date: Date;
  events?: Event[];
  onEventClick?: (event: Event) => void;
  className?: string;
}

export function WeekView({ date, events = [], onEventClick, className }: Props) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="font-medium">{format(day, 'EEE')}</div>
            <div className="text-sm text-muted-foreground">{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-4 min-h-[400px]">
        {days.map((day) => (
          <div key={day.toISOString()} className="border rounded-lg p-2">
            {events
              .filter(event => format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
              .map(event => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="w-full text-left mb-2 p-2 bg-primary/10 rounded hover:bg-primary/20"
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                  </div>
                  {event.location && (
                    <div className="text-sm text-muted-foreground truncate">
                      {event.location}
                    </div>
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
