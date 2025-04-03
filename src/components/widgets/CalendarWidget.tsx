
import React from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';

const CalendarWidget = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
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

  // Get only events for today
  const todayEvents = upcomingEvents.filter(
    event => event.date.toDateString() === new Date().toDateString()
  );

  return (
    <Card className="metallic-card shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" />
          <h3 className="font-medium text-todo-black">Calendar</h3>
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
              className="rounded-md border w-full max-w-[250px]"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Today's Events</h4>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map(event => (
                  <div key={event.id} className="p-2 border rounded-md bg-white">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events today</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
