import { useState, useCallback } from 'react';
import { Event } from '../types/event';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const useDragAndDrop = (events: Event[], onEventUpdate: (updatedEvent: Event) => void) => {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  const handleDragStart = useCallback((event: Event, clientY: number) => {
    setDraggedEvent(event);
    setIsDragging(true);
    
    // Calculate offset from the top of the event where the user clicked
    const eventElement = document.querySelector(`[data-event-id="${event.id}"]`);
    if (eventElement) {
      const rect = eventElement.getBoundingClientRect();
      setDragOffset({ x: 0, y: clientY - rect.top });
    }
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number, cellHeight: number) => {
    if (!isDragging || !draggedEvent) return;

    // This will be handled by the parent component that has the grid information
    // We'll pass the current mouse position and let the grid calculate the new position
  }, [isDragging, draggedEvent]);

  const handleDragEnd = useCallback((newStartDate: Date | null, newDay: Date | null) => {
    if (!isDragging || !draggedEvent || (!newStartDate && !newDay)) {
      setIsDragging(false);
      setDraggedEvent(null);
      return;
    }

    try {
      // Create a copy of the dragged event
      const updatedEvent = { ...draggedEvent };
      
      // If we're changing the time (within the same day)
      if (newStartDate) {
        const durationInMinutes = differenceInMinutes(
          draggedEvent.endDate,
          draggedEvent.startDate
        );
        
        // Update the start time and maintain the same duration
        updatedEvent.startDate = newStartDate;
        updatedEvent.endDate = addMinutes(newStartDate, durationInMinutes);
      }
      
      // If we're changing the day (keeping the same time)
      if (newDay && !newStartDate) {
        const updatedStartDate = new Date(newDay);
        updatedStartDate.setHours(
          draggedEvent.startDate.getHours(),
          draggedEvent.startDate.getMinutes()
        );
        
        const updatedEndDate = new Date(newDay);
        updatedEndDate.setHours(
          draggedEvent.endDate.getHours(),
          draggedEvent.endDate.getMinutes()
        );
        
        updatedEvent.startDate = updatedStartDate;
        updatedEvent.endDate = updatedEndDate;
      }
      
      // Save the updated event
      onEventUpdate(updatedEvent);
      
      toast({
        title: "Event updated",
        description: `${updatedEvent.title} has been moved successfully.`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "Error",
        description: "Failed to move the event. Please try again.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
    
    // Reset drag state
    setIsDragging(false);
    setDraggedEvent(null);
  }, [isDragging, draggedEvent, onEventUpdate, toast]);

  return {
    draggedEvent,
    isDragging,
    dragOffset,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
};
