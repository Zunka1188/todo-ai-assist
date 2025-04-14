
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarSharing } from './hooks/useCalendarSharing';
import { useCalendarViewHandlers } from './hooks/useCalendarViewHandlers';
import FileUploader from '../scanning/FileUploader';
import CalendarViewContent from './components/CalendarViewContent';
import EventDialogs from './components/EventDialogs';
import RSVPDialog from './dialogs/RSVPDialog';
import { Event, RSVPType } from './types/event';

interface ViewDimensions {
  minCellHeight: number;
  headerHeight: number;
  timeWidth: number;
}

interface CalendarViewProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
  searchTerm?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isCreateDialogOpen?: boolean;
  setIsCreateDialogOpen?: (open: boolean) => void;
  isFileUploaderOpen?: boolean;
  setIsFileUploaderOpen?: (open: boolean) => void;
  dimensions: ViewDimensions;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewMode,
  date,
  searchTerm = '',
  weekStartsOn = 1,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isFileUploaderOpen = false,
  setIsFileUploaderOpen = () => {},
  dimensions
}) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  // Get calendar events state and functions
  const {
    events,
    selectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    setIsEditMode,
    isRSVPDialogOpen,
    setIsRSVPDialogOpen,
    isLoading,
    error,
    isCreateDialogOpen: localCreateDialogOpen,
    setIsCreateDialogOpen: setLocalCreateDialogOpen,
    handleViewEvent,
    handleDeleteEvent,
    handleSaveEvent,
    handleRSVP,
    filterEvents
  } = useCalendarEvents();
  
  // Get calendar sharing functionality
  const {
    shareEvent,
    recordRSVP
  } = useCalendarSharing();
  
  // Event to perform RSVP for
  const [eventToRSVP, setEventToRSVP] = useState<Event | null>(null);
  const [existingRSVP, setExistingRSVP] = useState<RSVPType | undefined>(undefined);
  
  // Set up effective dialog state
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;
  
  // Get calendar view handlers
  const {
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
    handleSetDate
  } = useCalendarViewHandlers({
    handleViewEvent,
    handleSaveEvent,
    handleDeleteEvent,
    setIsViewDialogOpen,
    setIsEditMode,
    setIsFileUploaderOpen
  });
  
  // Filter events based on search term
  const filteredEvents = filterEvents(searchTerm);
  
  // Handle RSVP button click
  const handleOpenRSVP = useCallback((event: Event) => {
    setEventToRSVP(event);
    setIsRSVPDialogOpen(true);
    
    // Check if the user has already RSVP'd to this event
    // In a real app, this would use the user's actual ID
    const mockUserId = "current-user";
    const existingResponse = event.rsvp?.find(r => r.userId === mockUserId);
    setExistingRSVP(existingResponse);
  }, [setIsRSVPDialogOpen]);
  
  // Handle submitting an RSVP
  const handleSubmitRSVP = useCallback((eventId: string, userId: string, name: string, status: RSVPType['status'], comment?: string) => {
    try {
      handleRSVP(eventId, userId, name, status, comment);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error submitting RSVP:", err);
      setViewLoadError("Failed to submit RSVP. Please try again.");
    }
  }, [handleRSVP, setViewLoadError]);
  
  // Reset view error when changing view mode
  useEffect(() => {
    setViewLoadError(null);
  }, [viewMode, setViewLoadError]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error || viewLoadError) {
    return (
      <div className="text-center py-12 px-4" role="alert" aria-live="assertive">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{error || viewLoadError}</p>
        <Button onClick={() => window.location.reload()}>Reload Calendar</Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-2 w-full mx-auto max-w-full relative",
      isMobile ? "pb-2" : ""
    )}
    role="region"
    aria-label={`Calendar ${viewMode} view`}
    >
      {/* File uploader component */}
      {isFileUploaderOpen && (
        <FileUploader
          onClose={() => setIsFileUploaderOpen(false)}
          onSaveSuccess={handleFileUploadSuccess}
        />
      )}
      
      {/* Event dialogs */}
      <EventDialogs
        isFileUploaderOpen={isFileUploaderOpen}
        effectiveCreateDialogOpen={effectiveCreateDialogOpen}
        isEditMode={isEditMode}
        isViewDialogOpen={isViewDialogOpen}
        selectedEvent={selectedEvent}
        eventToShare={eventToShare}
        previewItem={previewItem}
        isImagePreviewOpen={isImagePreviewOpen}
        shareDialogOpen={shareDialogOpen}
        rsvpDialogOpen={rsvpDialogOpen}
        setIsFileUploaderOpen={setIsFileUploaderOpen}
        effectiveSetCreateDialogOpen={effectiveSetCreateDialogOpen}
        setIsEditMode={setIsEditMode}
        setIsViewDialogOpen={setIsViewDialogOpen}
        setIsImagePreviewOpen={setIsImagePreviewOpen}
        setPreviewItem={setPreviewItem}
        setShareDialogOpen={setShareDialogOpen}
        setRsvpDialogOpen={setRsvpDialogOpen}
        handleSaveEvent={handleSaveEvent}
        handleDeleteEvent={handleDeleteEvent}
        handleViewToEdit={handleViewToEdit}
        handleOpenImagePreview={handleOpenImagePreview}
        handleShareEvent={handleShareEvent}
        handleRSVP={handleOpenRSVP}
        handleShareLink={() => {}}
        submitRSVP={() => {}}
      />
      
      {/* RSVP Dialog */}
      <RSVPDialog
        isOpen={isRSVPDialogOpen}
        setIsOpen={setIsRSVPDialogOpen}
        event={eventToRSVP}
        onRSVP={handleSubmitRSVP}
        existingRSVP={existingRSVP}
      />
      
      {/* Calendar view content */}
      <CalendarViewContent
        viewMode={viewMode}
        date={date}
        filteredEvents={filteredEvents}
        handleViewEvent={handleViewEvent}
        handleSetDate={handleSetDate}
        theme={theme}
        weekStartsOn={weekStartsOn}
        dimensions={dimensions}
        isFileUploaderOpen={isFileUploaderOpen}
      />
    </div>
  );
};

export default CalendarView;
