
import { useState, useCallback, useMemo } from 'react';
import { Event } from '../types/event';
import { initialEvents } from '../data/initialEvents';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Memoized view event handler
  const handleViewEvent = useCallback((event: Event) => {
    try {
      console.log("[DEBUG] Calendar: Viewing event", event.id);
      setSelectedEvent(event);
      setIsViewDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] Calendar: Failed to view event", err);
      toast({
        title: "Error",
        description: "Failed to open event details",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Memoized edit event handler
  const handleEditEvent = useCallback(() => {
    try {
      setIsEditMode(true);
      setIsViewDialogOpen(false);
      setIsCreateDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] Calendar: Failed to edit event", err);
      toast({
        title: "Error",
        description: "Failed to open event editor",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Memoized delete event handler
  const handleDeleteEvent = useCallback(() => {
    if (!selectedEvent) return;
    
    try {
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
      console.error("[ERROR] Calendar: Failed to delete event", err);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [selectedEvent, toast]);

  // Memoized create event handler
  const handleCreateEvent = useCallback((date: Date) => {
    try {
      setSelectedEvent(null);
      setIsEditMode(false);
      setIsCreateDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] Calendar: Failed to create event", err);
      toast({
        title: "Error",
        description: "Failed to open event creator",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  // Memoized save event handler
  const handleSaveEvent = useCallback((newEvent: Event) => {
    setIsLoading(true);
    
    try {
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
      console.error("[ERROR] Calendar: Failed to save event", err);
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

  // Memoized filter function
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
    filterEvents
  };
};
