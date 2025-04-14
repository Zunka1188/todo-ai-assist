
import { useState, useCallback, useMemo } from 'react';
import { Event, AttachmentType, RSVPType } from '../types/event';
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
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);
  const { toast } = useToast();

  // Memoized view event handler
  const handleViewEvent = useCallback((event: Event) => {
    logger.log("[Calendar] Viewing event", event.id);
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  }, []);

  // Memoized edit event handler
  const handleEditEvent = useCallback(() => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Memoized delete event handler
  const handleDeleteEvent = useCallback((eventId: string) => {
    setIsLoading(true);
    
    try {
      // This is an async-like operation that could fail
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setIsViewDialogOpen(false);
      
      const deletedEvent = events.find(e => e.id === eventId);
      
      toast({
        title: "Event deleted",
        description: `"${deletedEvent?.title || 'Event'}" has been removed from your calendar.`,
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
  }, [events, toast]);

  // Memoized create event handler
  const handleCreateEvent = useCallback((date: Date) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Memoized save event handler with improved attachment handling
  const handleSaveEvent = useCallback((newEvent: Event) => {
    setIsLoading(true);
    
    try {
      // Process and store attachments if needed
      if (newEvent.attachments && newEvent.attachments.length > 0) {
        // In a real app, you might upload these to a storage service
        // For now we'll just ensure the URLs are properly stored
        
        const processedAttachments: AttachmentType[] = newEvent.attachments.map(attachment => {
          // Ensure each attachment has all required fields
          return {
            id: attachment.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: attachment.name,
            type: attachment.type,
            url: attachment.url,
            thumbnailUrl: attachment.thumbnailUrl || (attachment.type === 'image' ? attachment.url : undefined)
          };
        });
        
        newEvent.attachments = processedAttachments;
      }
      
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

  // New function to handle RSVP responses
  const handleRSVP = useCallback((eventId: string, userId: string, name: string, status: RSVPType['status'], comment?: string) => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      const response: RSVPType = {
        userId,
        name,
        status,
        timestamp: now,
        comment
      };
      
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          // Filter out any previous responses from the same user
          const filteredRSVPs = event.rsvp?.filter(r => r.userId !== userId) || [];
          
          return {
            ...event,
            rsvp: [...filteredRSVPs, response]
          };
        }
        return event;
      }));
      
      toast({
        title: "RSVP Recorded",
        description: `You've responded ${status} to the event.`,
        role: "status",
        "aria-live": "polite"
      });
      
      setIsRSVPDialogOpen(false);
    } catch (err) {
      logger.error("[Calendar] Failed to record RSVP", err);
      toast({
        title: "Error",
        description: "Failed to record your RSVP",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Function to get RSVP counts for an event
  const getRSVPCounts = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !event.rsvp) return { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 };
    
    return {
      yes: event.rsvp.filter(r => r.status === 'yes').length,
      no: event.rsvp.filter(r => r.status === 'no').length,
      maybe: event.rsvp.filter(r => r.status === 'maybe').length,
      pending: event.rsvp.filter(r => r.status === 'pending').length,
      total: event.rsvp.length
    };
  }, [events]);

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
    isRSVPDialogOpen,
    setIsRSVPDialogOpen,
    isLoading,
    error,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCreateEvent,
    handleSaveEvent,
    handleRSVP,
    getRSVPCounts,
    filterEvents
  };
};
