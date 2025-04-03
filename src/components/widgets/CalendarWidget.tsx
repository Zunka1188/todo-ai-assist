
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample upcoming events for demo
  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      date: new Date(),
      time: '10:00 AM'
    },
    {
      id: 2,
      title: 'Dentist Appointment',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '2:30 PM'
    }
  ];

  // Get only events for selected date
  const selectedDateEvents = upcomingEvents.filter(
    event => date && event.date.toDateString() === date.toDateString()
  );

  return (
    <Card className="metallic-card shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" />
          <h3 className="font-medium">Calendar</h3>
        </div>
        <Link to="/calendar" className="text-sm text-todo-purple flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="hidden sm:block">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full max-w-[250px] mx-auto bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 pointer-events-auto"
              classNames={{
                months: "w-full",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-1",
                cell: "h-8 w-8 text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 dark:text-gray-100",
                day_selected: "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground",
              }}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </h4>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "p-2 rounded-md bg-white dark:bg-gray-700",
                      "border dark:border-gray-600",
                      "hover:shadow-sm transition-shadow"
                    )}
                  >
                    <p className="font-medium text-sm dark:text-gray-100">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events on this date</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
