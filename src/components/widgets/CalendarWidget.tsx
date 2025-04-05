
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell, Clock, MapPin, Edit, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { initialEvents } from '../features/calendar/data/initialEvents';
import { Event } from '../features/calendar/types/event';
import { getReminderLabel, getFormattedTime } from '../features/calendar/utils/dateUtils';
import { WidgetWrapper } from './shared/WidgetWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import EventFormDialog from '../features/calendar/dialogs/EventFormDialog';
import EventViewDialog from '../features/calendar/dialogs/EventViewDialog';

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();

  // Filter events for the current date
  const eventsForToday = initialEvents.filter((event) => {
    return date ? isSameDay(event.startDate, date) : false;
  });

  // Get events for the selected date
  const eventsForSelectedDate = initialEvents.filter((event) => {
    return isSameDay(event.startDate, selectedDate);
  });

  // Handle date selection in calendar
  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setSelectedDate(date);
    }
    setOpen(false); // Close the popover after selecting a date
  };

  // Handle event click to show details
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  // Handle edit button click
  const handleViewToEdit = () => {
    setIsViewDialogOpen(false);
    setIsEditMode(true);
  };

  // Handle saving event after edit
  const handleSaveEvent = (updatedEvent: Event) => {
    console.log("Event saved:", updatedEvent);
    setIsEditMode(false);
    // In a real app, you would update the event in your state or database here
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    console.log("Event deleted:", selectedEvent?.id);
    setIsEditMode(false);
    setSelectedEvent(null);
    // In a real app, you would remove the event from your state or database here
  };

  return (
    <WidgetWrapper className="h-full">
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" />
          <h3 className={cn("font-medium text-base sm:text-lg", theme === 'light' ? "text-foreground" : "text-white")}>Calendar</h3>
        </div>
        <Link to="/calendar" className="text-xs sm:text-sm text-todo-purple flex items-center min-h-[44px] min-w-[44px] touch-manipulation">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="pb-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal mb-4",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setOpen(true)}
              >
                <span>
                  {date ? format(date, 'PPP') : 'Select date'}
                </span>
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {/* Today's events list */}
        <div className="space-y-3 mt-2">
          {eventsForSelectedDate.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No events for this day
            </div>
          ) : (
            eventsForSelectedDate.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-1 p-3 rounded-md cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleEventClick(event)}
                style={{ 
                  borderLeft: `4px solid ${event.color || '#4285F4'}`,
                  backgroundColor: `${event.color || '#4285F4'}10`
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" /> 
                  <span>
                    {event.allDay 
                      ? 'All day' 
                      : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> 
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                {event.reminder && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Bell className="h-3 w-3 mr-1" /> 
                    <span>{getReminderLabel(event.reminder)}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Event View Dialog */}
        <EventViewDialog
          isOpen={isViewDialogOpen}
          setIsOpen={setIsViewDialogOpen}
          selectedEvent={selectedEvent}
          onEdit={handleViewToEdit}
          onDelete={handleDeleteEvent}
        />
        
        {/* Event Form Dialog */}
        {selectedEvent && (
          <EventFormDialog
            isOpen={isEditMode}
            setIsOpen={(open) => setIsEditMode(open)}
            onSubmit={handleSaveEvent}
            selectedEvent={selectedEvent}
            isEditMode={true}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>
    </WidgetWrapper>
  );
};

export default CalendarWidget;
