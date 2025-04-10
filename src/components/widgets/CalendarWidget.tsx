
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
      return selectedDate ? isSameDay(event.startDate, selectedDate) : false;
    });
  }, [selectedDate]);

  // Format date for display
  const formattedDate = useMemo(() => {
    return date ? format(date, 'PPP') : '';
  }, [date]);

  // Handle date selection
  const handleSelect = useCallback((date: Date | undefined) => {
    setDate(date);
    setOpen(false);
  }, []);

  // Handle event click
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  }, []);

  // Handle view to edit transition
  const handleViewToEdit = useCallback(() => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
  }, []);

  // Handle closing event dialog
  const handleCloseEventDialog = useCallback(() => {
    setSelectedEvent(null);
    setIsViewDialogOpen(false);
  }, []);

  return (
    <WidgetWrapper
      title="Calendar"
      icon={<CalendarIcon className="h-4 w-4" />}
      linkTo="/calendar"
      className="h-full"
    >
      <div className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground p-4">
            {error}
          </div>
        ) : eventsForToday.length > 0 ? (
          <div className="space-y-1">
            {eventsForToday.slice(0, 3).map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted flex items-start"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0"
                  style={{ backgroundColor: event.color || '#4285F4' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                    {!event.allDay && (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {getFormattedTime(event.startDate)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[120px]">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {eventsForToday.length > 3 && (
              <div className="text-center text-xs text-muted-foreground pt-1">
                +{eventsForToday.length - 3} more events
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6">
            No events scheduled for today
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="gap-1">
              View Calendar <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {selectedEvent && (
        <EventViewDialog
          isOpen={isViewDialogOpen}
          setIsOpen={setIsViewDialogOpen}
          event={selectedEvent}
          onEdit={handleViewToEdit}
        />
      )}
    </WidgetWrapper>
  );
};

export default CalendarWidget;
