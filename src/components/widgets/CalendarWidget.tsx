import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
  };
  reminder?: string;
}

const upcomingEvents: Event[] = [{
  id: '1',
  title: 'Team Meeting',
  description: 'Weekly team sync to discuss project progress',
  startDate: new Date(2025, 3, 5, 10, 0),
  endDate: new Date(2025, 3, 5, 11, 30),
  location: 'Conference Room A',
  color: '#4285F4',
  reminder: '30',
  recurring: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1]
  }
}, {
  id: '2',
  title: 'Dentist Appointment',
  description: 'Regular check-up with Dr. Smith',
  startDate: new Date(2025, 3, 8, 14, 30),
  endDate: new Date(2025, 3, 8, 15, 30),
  location: 'Dental Clinic',
  color: '#EA4335',
  reminder: '60'
}, {
  id: '3',
  title: 'Grocery Shopping',
  description: 'Buy weekly groceries',
  startDate: new Date(2025, 3, 3, 18, 0),
  endDate: new Date(2025, 3, 3, 19, 0),
  location: 'Supermarket',
  color: '#34A853',
  reminder: '15'
}];

const reminderOptions = [{
  value: "none",
  label: "No reminder"
}, {
  value: "0",
  label: "At time of event"
}, {
  value: "5",
  label: "5 minutes before"
}, {
  value: "10",
  label: "10 minutes before"
}, {
  value: "15",
  label: "15 minutes before"
}, {
  value: "30",
  label: "30 minutes before"
}, {
  value: "60",
  label: "1 hour before"
}, {
  value: "120",
  label: "2 hours before"
}, {
  value: "1440",
  label: "1 day before"
}, {
  value: "2880",
  label: "2 days before"
}];

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<typeof upcomingEvents>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [viewEventDialogOpen, setViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { theme } = useTheme();

  const isDayWithEvent = (day: Date) => {
    return upcomingEvents.some(event => isSameDay(event.startDate, day) || isSameDay(event.endDate, day) || event.startDate <= day && event.endDate >= day);
  };

  const handleDaySelect = (day: Date | undefined) => {
    setDate(day);
    if (day) {
      const dayEvents = upcomingEvents.filter(event => isSameDay(event.startDate, day) || isSameDay(event.endDate, day) || event.startDate <= day && event.endDate >= day);
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setOpen(false);
    setViewEventDialogOpen(true);
  };

  const getReminderLabel = (value: string) => {
    const option = reminderOptions.find(opt => opt.value === value);
    return option ? option.label : "No reminder";
  };

  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return <Card className="h-full shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" />
          <h3 className={cn("font-medium text-base sm:text-lg", theme === 'light' ? "text-foreground" : "text-white")}>Calendar</h3>
        </div>
        <Link to="/calendar" className="text-xs sm:text-sm text-todo-purple flex items-center min-h-[44px] min-w-[44px] touch-manipulation">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="pb-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex justify-center">
              <Calendar mode="single" selected={date} onSelect={handleDaySelect} weekStartsOn={1}
            modifiers={{
              event: date => isDayWithEvent(date)
            }} modifiersStyles={{
              event: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(155, 135, 245, 0.1)',
                color: '#7E69AB',
                borderColor: '#9b87f5'
              }
            }} className="rounded-lg border bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 shadow w-full pointer-events-auto mx-auto" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] sm:w-80 p-0">
            {selectedDay && <div className="p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-todo-purple text-sm sm:text-base">
                  {selectedDay?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedDayEvents.map(event => <div key={event.id} className="p-2 sm:p-3 rounded-lg border border-border bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 touch-manipulation" onClick={() => handleEventClick(event)}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                    backgroundColor: event.color
                  }} />
                        <h5 className={cn("font-medium flex-1 text-xs sm:text-sm", theme === 'light' ? "text-todo-black" : "text-white")}>
                          {event.title}
                        </h5>
                      </div>
                      <div className="mt-1 sm:mt-2 space-y-1 text-xs sm:text-sm text-muted-foreground">
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          {event.allDay ? 'All day' : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                        </p>
                        {event.location && <p className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {event.location}
                          </p>}
                        {event.reminder && event.reminder !== 'none' && <p className="flex items-center">
                            <Bell className="h-3 w-3 mr-1 text-todo-purple" />
                            {getReminderLabel(event.reminder)}
                          </p>}
                      </div>
                    </div>)}
                </div>
              </div>}
          </PopoverContent>
        </Popover>
        
        <Dialog open={viewEventDialogOpen} onOpenChange={setViewEventDialogOpen}>
          {selectedEvent && <DialogContent className="max-w-[320px] sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: selectedEvent.color
              }} />
                  <DialogTitle className="text-sm sm:text-base">
                    {selectedEvent.title}
                  </DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">
                      {selectedEvent.allDay ? 'All day' : `${getFormattedTime(selectedEvent.startDate)} - ${getFormattedTime(selectedEvent.endDate)}`}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {format(selectedEvent.startDate, 'EEEE, MMMM d, yyyy')}
                      {!isSameDay(selectedEvent.startDate, selectedEvent.endDate) && <> - {format(selectedEvent.endDate, 'EEEE, MMMM d, yyyy')}</>}
                    </p>
                    {selectedEvent.recurring && <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Recurring: </span>
                        {selectedEvent.recurring.frequency.charAt(0).toUpperCase() + selectedEvent.recurring.frequency.slice(1)}
                      </p>}
                  </div>
                </div>
                
                {selectedEvent.location && <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm">{selectedEvent.location}</p>
                    </div>
                  </div>}
                
                {selectedEvent.reminder && selectedEvent.reminder !== 'none' && <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm">{getReminderLabel(selectedEvent.reminder)}</p>
                    </div>
                  </div>}
                
                {selectedEvent.description && <div className="mt-3 sm:mt-4">
                    <h4 className="text-xs sm:text-sm font-medium mb-1">Description</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">{selectedEvent.description}</p>
                  </div>}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-xs sm:text-sm min-h-[44px] touch-manipulation">Close</Button>
                </DialogClose>
                <Button asChild className="text-xs sm:text-sm min-h-[44px] touch-manipulation">
                  <Link to="/calendar">View in Calendar</Link>
                </Button>
              </DialogFooter>
            </DialogContent>}
        </Dialog>
      </CardContent>
    </Card>;
};

export default CalendarWidget;
