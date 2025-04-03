
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

// Sample upcoming events for demo - matching the structure in CalendarView
const upcomingEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(2025, 3, 5), // April 5, 2025
    time: '10:00 AM',
    location: 'Conference Room A',
    reminder: '30'
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    date: new Date(2025, 3, 8), // April 8, 2025
    time: '2:30 PM',
    location: 'Dental Clinic',
    reminder: '60'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    date: new Date(2025, 3, 3), // April 3, 2025 (today)
    time: '6:00 PM',
    location: 'Supermarket',
    reminder: '15'
  }
];

const reminderOptions = [
  { value: "none", label: "No reminder" },
  { value: "0", label: "At time of event" },
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
  { value: "2880", label: "2 days before" },
];

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<typeof upcomingEvents>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  
  // Function to check if a date has events
  const isDayWithEvent = (day: Date) => {
    return upcomingEvents.some(
      (event) => 
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  // Handle day selection to show events in popover
  const handleDaySelect = (day: Date | undefined) => {
    setDate(day);
    
    if (day) {
      const dayEvents = upcomingEvents.filter(
        event => 
          event.date.getDate() === day.getDate() &&
          event.date.getMonth() === day.getMonth() &&
          event.date.getFullYear() === day.getFullYear()
      );
      
      if (dayEvents.length > 0) {
        setSelectedDayEvents(dayEvents);
        setSelectedDay(day);
        setOpen(true);
      } else {
        setSelectedDayEvents([]);
        setOpen(false);
      }
    }
  };
  
  const getReminderLabel = (value: string) => {
    const option = reminderOptions.find(opt => opt.value === value);
    return option ? option.label : "No reminder";
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDaySelect}
                className="rounded-lg border bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 shadow w-full mx-auto"
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
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            {selectedDay && (
              <div className="p-4">
                <h4 className="font-medium mb-2 text-todo-purple">
                  {selectedDay?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 rounded-lg border border-border bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <h5 className="font-medium text-todo-black dark:text-white">
                        {event.title}
                        <span className="ml-2 text-xs text-todo-purple bg-todo-purple/10 px-2 py-0.5 rounded">
                          Event
                        </span>
                      </h5>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {event.time && <p>⏰ {event.time}</p>}
                        {event.location && <p>📍 {event.location}</p>}
                        {event.reminder && event.reminder !== 'none' && (
                          <p className="flex items-center">
                            <Bell className="h-3 w-3 mr-1 text-todo-purple" />
                            {getReminderLabel(event.reminder)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
