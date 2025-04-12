import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import MonthView from './views/MonthView';
import WeekView from './views/week-view/index';
import DayView from './views/day-view';
import EnhancedAgendaView from './views/EnhancedAgendaView';
import AgendaView from './views/AgendaView';
import EventFormDialog from './dialogs/EventFormDialog';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarSharing } from './hooks/useCalendarSharing';
import FileUploader from '../scanning/FileUploader';
import FullScreenPreview from '../documents/FullScreenPreview';
import InviteDialog from './dialogs/InviteDialog';
import RSVPDialog from './dialogs/RSVPDialog';
import { Event, AttachmentType } from './types/event';
import EventViewDialogExtension from './dialogs/EventViewDialogExtension';
import ErrorBoundary from './ErrorBoundary';

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
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [eventToShare, setEventToShare] = useState<Event | null>(null);
  const [viewLoadError, setViewLoadError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  const {
    events,
    selectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    setIsEditMode,
    isLoading,
    error,
    isCreateDialogOpen: localCreateDialogOpen,
    setIsCreateDialogOpen: setLocalCreateDialogOpen,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCreateEvent,
    handleSaveEvent,
    handleUpdateEvent,
    filterEvents
  } = useCalendarEvents();
  
  const {
    shareEvent,
    recordRSVP
  } = useCalendarSharing();
  
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;
  
  const filteredEvents = filterEvents(searchTerm);

  useEffect(() => {
    setViewLoadError(null);
  }, [viewMode]);

  const handleViewToEdit = useCallback(() => {
    try {
      setIsViewDialogOpen(false);
      setIsEditMode(true);
      setTimeout(() => {
        effectiveSetCreateDialogOpen(true);
      }, 100);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error transitioning from view to edit:", err);
      setViewLoadError("Failed to edit event. Please try again.");
    }
  }, [setIsViewDialogOpen, setIsEditMode, effectiveSetCreateDialogOpen]);

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

  const handleShareEvent = useCallback((event: Event) => {
    try {
      setEventToShare(event);
      setShareDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening share dialog:", err);
      setViewLoadError("Failed to open sharing options. Please try again.");
    }
  }, []);

  const handleRSVP = useCallback((event: Event) => {
    try {
      setEventToShare(event);
      setRsvpDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening RSVP dialog:", err);
      setViewLoadError("Failed to open RSVP options. Please try again.");
    }
  }, []);

  const submitRSVP = useCallback((status: 'yes' | 'no' | 'maybe', name: string) => {
    try {
      if (!eventToShare) return;
      recordRSVP(eventToShare.id, name, status);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error submitting RSVP:", err);
      setViewLoadError("Failed to submit RSVP. Please try again.");
    }
  }, [eventToShare, recordRSVP]);

  const handleShareLink = useCallback((link: string) => {
    console.log("[DEBUG] Share link generated:", link);
  }, []);

  const handleSetDate = useCallback((newDate: Date) => {
    if (setIsCreateDialogOpen) {
      console.log("[DEBUG] Date changed:", format(newDate, 'yyyy-MM-dd'));
    }
  }, [setIsCreateDialogOpen]);

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
      {isFileUploaderOpen && (
        <FileUploader
          onClose={() => setIsFileUploaderOpen(false)}
          onSaveSuccess={handleFileUploadSuccess}
        />
      )}
      
      <EventFormDialog
        isOpen={(effectiveCreateDialogOpen || isEditMode) && !isFileUploaderOpen && !isViewDialogOpen}
        setIsOpen={(open) => {
          effectiveSetCreateDialogOpen(open);
          if (!open) setIsEditMode(false);
        }}
        onSubmit={handleSaveEvent}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
        onDeleteEvent={handleDeleteEvent}
      />
      
      <EventViewDialogExtension
        isOpen={isViewDialogOpen && !isFileUploaderOpen}
        setIsOpen={setIsViewDialogOpen}
        selectedEvent={selectedEvent}
        onEdit={handleViewToEdit}
        onDelete={handleDeleteEvent}
        onViewImage={handleOpenImagePreview}
        onShare={handleShareEvent}
        onRSVP={handleRSVP}
      />
      
      <FullScreenPreview 
        item={previewItem}
        onClose={() => {
          setIsImagePreviewOpen(false);
          setPreviewItem(null);
        }}
        readOnly={false}
      />

      <InviteDialog
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        event={eventToShare}
        onShareLink={handleShareLink}
      />
      
      <RSVPDialog
        isOpen={rsvpDialogOpen}
        setIsOpen={setRsvpDialogOpen}
        event={eventToShare}
        onRSVP={submitRSVP}
      />
      
      {!isFileUploaderOpen && (
        <ErrorBoundary>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            {viewMode === 'month' && (
              <MonthView
                date={date}
                setDate={handleSetDate}
                events={filteredEvents}
                handleViewEvent={handleViewEvent}
                theme={theme}
                weekStartsOn={weekStartsOn}
                minCellHeight={dimensions.minCellHeight}
              />
            )}
            
            {viewMode === 'week' && (
              <WeekView
                date={date}
                setDate={handleSetDate}
                events={filteredEvents}
                handleViewEvent={handleViewEvent}
                theme={theme}
                weekStartsOn={weekStartsOn}
                minCellHeight={dimensions.minCellHeight}
                timeColumnWidth={dimensions.timeWidth}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            
            {viewMode === 'day' && (
              <DayView
                date={date}
                events={filteredEvents}
                handleViewEvent={handleViewEvent}
                theme={theme}
                minCellHeight={dimensions.minCellHeight}
                timeColumnWidth={dimensions.timeWidth}
                onUpdateEvent={handleUpdateEvent}
              />
            )}
            
            {viewMode === 'agenda' && (
              <AgendaView
                date={date}
                setDate={handleSetDate}
                events={filteredEvents}
                handleViewEvent={handleViewEvent}
                theme={theme}
                itemHeight={dimensions.minCellHeight}
              />
            )}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default CalendarView;
