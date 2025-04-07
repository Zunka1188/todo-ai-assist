
import { useState, useCallback, useMemo } from 'react';
import { Event } from '../types/event';
import { initialEvents } from '../data/initialEvents';
import { useToast } from '@/hooks/use-toast';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleViewEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditEvent = useCallback(() => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsCreateDialogOpen(true);
  }, []);

  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      toast({
        title: "Event deleted",
        description: `"${selectedEvent.title}" has been removed from your calendar.`
      });
      setSelectedEvent(null);
    }
  }, [selectedEvent, toast]);

  const handleCreateEvent = useCallback((date: Date) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsCreateDialogOpen(true);
  }, []);

  const handleSaveEvent = useCallback((newEvent: Event) => {
    if (isEditMode && selectedEvent) {
      setEvents(prev => prev.map(event => event.id === selectedEvent.id ? newEvent : event));
      toast({
        title: "Event updated",
        description: `Changes to "${newEvent.title}" have been saved.`
      });
    } else {
      setEvents(prev => [...prev, newEvent]);
      toast({
        title: "Event created",
        description: `"${newEvent.title}" has been added to your calendar.`
      });
    }
    setIsCreateDialogOpen(false);
    setIsEditMode(false);
    setSelectedEvent(null);
  }, [isEditMode, selectedEvent, toast]);

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
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCreateEvent,
    handleSaveEvent,
    filterEvents
  };
};
