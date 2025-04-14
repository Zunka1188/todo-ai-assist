
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Event, AttachmentType } from '../types/event';

export const useCalendarViewHandlers = ({
  handleViewEvent,
  handleSaveEvent,
  handleDeleteEvent,
  setIsViewDialogOpen,
  setIsEditMode,
  setIsFileUploaderOpen
}: {
  handleViewEvent: (event: Event) => void;
  handleSaveEvent: (event: Event) => void;
  handleDeleteEvent: (id: string) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setIsFileUploaderOpen: (open: boolean) => void;
}) => {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [eventToShare, setEventToShare] = useState<Event | null>(null);
  const [viewLoadError, setViewLoadError] = useState<string | null>(null);

  // Handle transition from view to edit mode
  const handleViewToEdit = useCallback(() => {
    try {
      setIsViewDialogOpen(false);
      setIsEditMode(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error transitioning from view to edit:", err);
      setViewLoadError("Failed to edit event. Please try again.");
    }
  }, [setIsViewDialogOpen, setIsEditMode]);

  // Handle file upload success and create event
  const handleFileUploadSuccess = useCallback((data: any) => {
    try {
      setIsFileUploaderOpen(false);
      
      const attachments: AttachmentType[] = [];
      
      if (data.file || data.content) {
        const attachment: AttachmentType = {
          id: `attachment-${Date.now()}`,
          name: data.title || 'Uploaded file',
          type: 'image',
          url: data.file || data.content || '',
          thumbnailUrl: data.thumbnailUrl || undefined
        };
        
        attachments.push(attachment);
      }
      
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        title: data.title || 'Event from file',
        description: data.description || '',
        startDate: data.date ? new Date(data.date) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 3600000),
        location: data.location || '',
        color: data.color || '#4285F4',
        allDay: false,
        reminder: '30',
        attachments: attachments
      };
      
      handleSaveEvent(newEvent);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error handling file upload:", err);
      setViewLoadError("Failed to process uploaded file. Please try again.");
    }
  }, [setIsFileUploaderOpen, handleSaveEvent]);

  // Image preview handling
  const handleOpenImagePreview = useCallback((event: any) => {
    try {
      if (event.image) {
        setPreviewItem({
          id: event.id,
          title: event.title,
          type: 'image',
          content: event.image,
          fileName: `${event.title}-image`
        });
        setIsImagePreviewOpen(true);
      }
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening image preview:", err);
      setViewLoadError("Failed to open image preview. Please try again.");
    }
  }, []);

  // Event sharing functionality
  const handleShareEvent = useCallback((event: Event) => {
    try {
      setEventToShare(event);
      setShareDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening share dialog:", err);
      setViewLoadError("Failed to open sharing options. Please try again.");
    }
  }, []);

  // RSVP functionality
  const handleRSVP = useCallback((event: Event) => {
    try {
      setEventToShare(event);
      setRsvpDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening RSVP dialog:", err);
      setViewLoadError("Failed to open RSVP options. Please try again.");
    }
  }, []);

  // Handle date changes in the view
  const handleSetDate = useCallback((newDate: Date) => {
    // Since we're in CalendarView component, we want to log date changes
    console.log("[DEBUG] Date changed:", format(newDate, 'yyyy-MM-dd'));
    // The actual date change logic is handled by useCalendar context in the parent
  }, []);

  return {
    isImagePreviewOpen,
    setIsImagePreviewOpen,
    previewItem,
    setPreviewItem,
    shareDialogOpen,
    setShareDialogOpen,
    rsvpDialogOpen,
    setRsvpDialogOpen,
    eventToShare,
    setEventToShare,
    viewLoadError,
    setViewLoadError,
    handleViewToEdit,
    handleFileUploadSuccess,
    handleOpenImagePreview,
    handleShareEvent,
    handleRSVP,
    handleSetDate
  };
};
