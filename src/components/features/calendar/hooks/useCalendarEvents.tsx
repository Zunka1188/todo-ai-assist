
import { useState } from 'react';
import { Event } from '../types/event';
import { initialEvents } from '../data/initialEvents';
import { toast } from '@/hooks/use-toast';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditEvent = () => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      toast({
        title: "Event deleted",
        description: `"${selectedEvent.title}" has been removed from your calendar.`
      });
      setSelectedEvent(null);
    }
  };

  const handleCreateEvent = (date: Date) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsCreateDialogOpen(true);
  };

  const handleSaveEvent = (newEvent: Event) => {
    if (isEditMode && selectedEvent) {
      setEvents(events.map(event => event.id === selectedEvent.id ? newEvent : event));
      toast({
        title: "Event updated",
        description: `Changes to "${newEvent.title}" have been saved.`
      });
    } else {
      setEvents([...events, newEvent]);
      toast({
        title: "Event created",
        description: `"${newEvent.title}" has been added to your calendar.`
      });
    }
    setIsCreateDialogOpen(false);
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  const filterEvents = (searchTerm: string) => {
    if (!searchTerm) return events;
    
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
