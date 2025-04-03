
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

  // Function to highlight dates with events
  const isDayWithEvent = (day: Date) => {
    return upcomingEvents.some(
      (event) => 
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  // Function to check if a date is today
  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

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
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 shadow pointer-events-auto w-full mx-auto"
          components={{
            DayContent: ({ date }) => {
              const isCurrentDay = isToday(date);
              const hasEvent = isDayWithEvent(date);
              
              return (
                <div 
                  className={cn(
                    "relative h-8 w-8 p-0 flex items-center justify-center", 
                    {
                      "font-bold": isCurrentDay || hasEvent,
                      "text-[#9b87f5]": isCurrentDay,
                      "bg-[rgba(155,135,245,0.1)] text-[#7E69AB] border-[#9b87f5]": hasEvent && !isCurrentDay,
                    }
                  )}
                >
                  <span>
                    {date.getDate()}
                  </span>
                </div>
              );
            }
          }}
          showOutsideDays={true}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
