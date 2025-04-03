
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
}

// Sample events for the demo
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(2025, 3, 5), // April 5, 2025
    time: '10:00 AM',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    date: new Date(2025, 3, 8), // April 8, 2025
    time: '2:30 PM',
    location: 'Dental Clinic'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    date: new Date(2025, 3, 3), // April 3, 2025 (today)
    time: '6:00 PM',
    location: 'Supermarket'
  }
];

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events] = useState<Event[]>(initialEvents);

  // Get events for the selected date
  const selectedDateEvents = events.filter(
    (event) => 
      date && 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  // Function to highlight dates with events
  const isDayWithEvent = (day: Date) => {
    return events.some(
      (event) => 
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border shadow bg-white"
        modifiers={{
          event: (date) => isDayWithEvent(date),
        }}
        modifiersStyles={{
          event: { 
            fontWeight: 'bold', 
            backgroundColor: 'rgba(155, 135, 245, 0.1)',
            color: '#7E69AB',
            borderColor: '#9b87f5' 
          }
        }}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-todo-purple" />
          {date ? (
            <span>
              Events for {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          ) : 'No date selected'}
        </h3>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <div 
                key={event.id}
                className={cn(
                  "p-4 rounded-lg border border-border",
                  "bg-white shadow-sm hover:shadow transition-shadow"
                )}
              >
                <h4 className="font-medium text-todo-black">{event.title}</h4>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {event.time && <p>⏰ {event.time}</p>}
                  {event.location && <p>📍 {event.location}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No events scheduled for this day</p>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
