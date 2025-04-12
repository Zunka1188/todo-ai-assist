import { useState, useCallback, useEffect, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { Event } from '@/components/features/calendar/types/event';
import { initialEvents } from '@/components/features/calendar/data/initialEvents';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useCalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load events initially
  useEffect(() => {
    let isMounted = true;
    
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          logger.error('[CalendarWidget] Failed to load events', err);
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
      }
    };
    
    loadEvents();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Memoize filtered events for better performance
  // Filter events for the current date
  const eventsForToday = useMemo(() => {
    return initialEvents.filter((event) => {
      return date ? isSameDay(event.startDate, date) : false;
    });
  }, [date]);

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

  return {
    date,
    open,
    setOpen,
    selectedEvent,
    setSelectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    isLoading,
    error,
    eventsForToday,
    formattedDate,
    handleSelect,
    handleEventClick,
    handleViewToEdit,
    handleCloseEventDialog
  };
};
