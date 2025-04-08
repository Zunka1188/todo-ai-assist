
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell, Clock, MapPin, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();

  // Load events initially
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsLoading(false);
      } catch (err) {
        console.error('[ERROR] CalendarWidget - Failed to load events', err);
        setError('Failed to load calendar events');
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load calendar events",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
      }
    };
    
    loadEvents();
  }, [toast]);

  // Memoize filtered events for better performance
  // Filter events for the current date
  const eventsForToday = useMemo(() => {
    return initialEvents.filter((event) => {
      return date ? isSameDay(event.startDate, date) : false;
    });
  }, [date]);

  // Get events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    return initialEvents.filter((event) => {
      return isSameDay(event.startDate, selectedDate);
    });
  }, [selectedDate]);

  // Get events for the upcoming days
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return initialEvents
      .filter(event => event.startDate >= today && event.startDate <= nextWeek)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, []);

  // Handle date selection in calendar
  const handleSelect = useCallback((date: Date | undefined) => {
    try {
      setDate(date);
      if (date) {
        setSelectedDate(date);
      }
      setOpen(false);
    } catch (err) {
      console.error('[ERROR] CalendarWidget - Error selecting date', err);
      toast({
        title: "Error",
        description: "Failed to select date",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Handle event click to show details
  const handleEventClick = useCallback((event: Event) => {
    try {
      setSelectedEvent(event);
      setIsViewDialogOpen(true);
    } catch (err) {
      console.error('[ERROR] CalendarWidget - Error opening event details', err);
      toast({
        title: "Error",
        description: "Failed to open event details",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Handle edit button click
  const handleViewToEdit = useCallback(() => {
    try {
      setIsViewDialogOpen(false);
      setIsEditMode(true);
    } catch (err) {
      console.error('[ERROR] CalendarWidget - Error switching to edit mode', err);
      toast({
        title: "Error",
        description: "Failed to edit event",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Handle saving event after edit
  const handleSaveEvent = useCallback((updatedEvent: Event) => {
    try {
      console.log("Event saved:", updatedEvent);
      setIsEditMode(false);
      toast({
        title: "Event Updated",
        description: `"${updatedEvent.title}" has been updated.`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (err) {
      console.error('[ERROR] CalendarWidget - Error saving event', err);
      toast({
        title: "Error",
        description: "Failed to save event changes",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Handle delete event
  const handleDeleteEvent = useCallback(() => {
    try {
      const eventTitle = selectedEvent?.title || 'Event';
      console.log("Event deleted:", selectedEvent?.id);
      setIsEditMode(false);
      setIsViewDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Event Deleted",
        description: `"${eventTitle}" has been removed from your calendar.`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (err) {
      console.error('[ERROR] CalendarWidget - Error deleting event', err);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [selectedEvent, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <WidgetWrapper className="h-full">
        <div className="flex flex-col items-center justify-center h-full py-8">
          <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
          <p className="text-muted-foreground text-sm">Loading calendar...</p>
        </div>
      </WidgetWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <WidgetWrapper className="h-full">
        <div className="flex flex-col items-center justify-center h-full py-8 px-2">
          <p className="text-destructive text-sm mb-2">Unable to load calendar events</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper className="h-full">
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" aria-hidden="true" />
          <h3 className={cn("font-medium text-base sm:text-lg", theme === 'light' ? "text-foreground" : "text-white")}>
            Calendar
          </h3>
        </div>
        <Link 
          to="/calendar" 
          className="text-xs sm:text-sm text-todo-purple flex items-center min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label="View all calendar events"
        >
          View all <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
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
                  !date && "text-muted-foreground",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                )}
                onClick={() => setOpen(true)}
                aria-label="Select date"
              >
                <span className={isMobile ? "text-sm" : ""}>
                  {date ? format(date, 'PPP') : 'Select date'}
                </span>
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />
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
        <div 
          className="space-y-2 mt-2"
          aria-label={`Events for ${date ? format(date, 'PPP') : 'today'}`}
          role="region"
        >
          {eventsForSelectedDate.length === 0 ? (
            <div 
              className="text-center text-muted-foreground text-sm py-4"
              role="status"
              aria-live="polite"
            >
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
                role="button"
                tabIndex={0}
                aria-label={`Event: ${event.title} at ${getFormattedTime(event.startDate)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleEventClick(event);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium line-clamp-1 ${isMobile ? "text-xs" : "text-sm"}`}>{event.title}</h4>
                </div>
                
                <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                  <Clock className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} aria-hidden="true" /> 
                  <span>
                    {event.allDay 
                      ? 'All day' 
                      : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                  </span>
                </div>
                
                {event.location && (
                  <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                    <MapPin className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} aria-hidden="true" /> 
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                {event.reminder && event.reminder !== 'none' && (
                  <div className={`flex items-center text-muted-foreground ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                    <Bell className={`mr-1 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} aria-hidden="true" /> 
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
