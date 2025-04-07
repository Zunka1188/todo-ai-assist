
import React, { useState, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, addDays } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();

  // Filter events for the current date
  const eventsForToday = React.useMemo(() => {
    return date ? initialEvents.filter(event => isSameDay(event.startDate, date)) : [];
  }, [date]);

  // Get events for the selected date
  const eventsForSelectedDate = React.useMemo(() => {
    return initialEvents.filter(event => isSameDay(event.startDate, selectedDate));
  }, [selectedDate]);

  // Get events for the upcoming days
  const getUpcomingEvents = useCallback(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return initialEvents
      .filter(event => event.startDate >= today && event.startDate <= nextWeek)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, []);
  
  const upcomingEvents = React.useMemo(() => getUpcomingEvents(), [getUpcomingEvents]);

  // Handle date selection in calendar
  const handleSelect = useCallback((newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setSelectedDate(newDate);
    }
    setOpen(false);
  }, []);

  // Handle event click to show details
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit button click
  const handleViewToEdit = useCallback(() => {
    setIsViewDialogOpen(false);
    setIsEditMode(true);
  }, []);

  // Handle saving event after edit
  const handleSaveEvent = useCallback((updatedEvent: Event) => {
    console.log("Event saved:", updatedEvent);
    setIsEditMode(false);
    toast({
      title: "Event Updated",
      description: `"${updatedEvent.title}" has been updated.`
    });
  }, [toast]);

  // Handle delete event
  const handleDeleteEvent = useCallback(() => {
    const eventTitle = selectedEvent?.title || 'Event';
    console.log("Event deleted:", selectedEvent?.id);
    setIsEditMode(false);
    setIsViewDialogOpen(false);
    setSelectedEvent(null);
    toast({
      title: "Event Deleted",
      description: `"${eventTitle}" has been removed from your calendar.`
    });
  }, [selectedEvent, toast]);

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
                <span className={isMobile ? "text-sm" : ""}>
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
                className="flex flex-col space-y-1 p-3 rounded-md cursor-pointer hover:bg-accent transition-colors touch-manipulation"
                onClick={() => handleEventClick(event)}
                style={{ 
                  borderLeft: `4px solid ${event.color || '#4285F4'}`,
                  backgroundColor: `${event.color || '#4285F4'}10`
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium line-clamp-1 ${isMobile ? "text-xs" : "text-sm"}`}>{event.title}</h4>
                </div>
                
                <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                  <Clock className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} /> 
                  <span>
                    {event.allDay 
                      ? 'All day' 
                      : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                  </span>
                </div>
                
                {event.location && (
                  <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                    <MapPin className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} /> 
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                {event.reminder && event.reminder !== 'none' && (
                  <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                    <Bell className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} /> 
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
