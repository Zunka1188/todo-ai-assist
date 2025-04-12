
import { useState, useCallback, useMemo } from 'react';
import { Event } from '../types/event';
import { initialEvents } from '../data/initialEvents';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { logger } from '@/utils/logger';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add retryDataFetch function
  const retryDataFetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay and success
      setTimeout(() => {
        setEvents(initialEvents);
        setIsLoading(false);
        
        toast({
          title: "Data refreshed",
          description: "Calendar events have been reloaded",
          role: "status",
          "aria-live": "polite"
        });
      }, 800);
    } catch (err) {
      logger.error("[Calendar] Failed to fetch events", err);
      setError("Could not load calendar events. Please try again later.");
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to refresh calendar data",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Memoized view event handler - removed unnecessary try/catch
  const handleViewEvent = useCallback((event: Event) => {
    logger.log("[Calendar] Viewing event", event.id);
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  }, []);

  // Memoized edit event handler - removed unnecessary try/catch
  const handleEditEvent = useCallback(() => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Memoized delete event handler
  const handleDeleteEvent = useCallback(() => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    
    try {
      // This is an async-like operation that could fail
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      
      toast({
        title: "Event deleted",
        description: `"${selectedEvent.title}" has been removed from your calendar.`,
        role: "status",
        "aria-live": "polite"
      });
      
      setSelectedEvent(null);
    } catch (err) {
      logger.error("[Calendar] Failed to delete event", err);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvent, toast]);

  // Memoized create event handler - removed unnecessary try/catch
  const handleCreateEvent = useCallback((date: Date) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Memoized save event handler
  const handleSaveEvent = useCallback((newEvent: Event) => {
    setIsLoading(true);
    
    try {
      // This operation could potentially fail (API call in real app)
      if (isEditMode && selectedEvent) {
        setEvents(prev => prev.map(event => 
          event.id === selectedEvent.id ? newEvent : event
        ));
        
        toast({
          title: "Event updated",
          description: `Changes to "${newEvent.title}" have been saved.`,
          role: "status",
          "aria-live": "polite"
        });
      } else {
        setEvents(prev => [...prev, newEvent]);
        
        toast({
          title: "Event created",
          description: `"${newEvent.title}" has been added to your calendar.`,
          role: "status", 
          "aria-live": "polite"
        });
      }
      
      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    } catch (err) {
      logger.error("[Calendar] Failed to save event", err);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isEditMode, selectedEvent, toast]);

  // Memoized filter function - optimized for performance
  const filterEvents = useCallback((searchTerm: string) => {
    if (!searchTerm) return events;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return events.filter(event => 
      event.title.toLowerCase().includes(lowerSearchTerm) || 
      (event.description && event.description.toLowerCase().includes(lowerSearchTerm)) || 
      (event.location && event.location.toLowerCase().includes(lowerSearchTerm))
    );
  }, [events]);

  return {
    events,
    selectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    setIsEditMode,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isLoading,
    error,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCreateEvent,
    handleSaveEvent,
    filterEvents,
    retryDataFetch
  };
};
