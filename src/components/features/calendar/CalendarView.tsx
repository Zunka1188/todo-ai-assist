
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
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

interface CalendarConfig {
  weekView?: {
    maxTime?: string;
    hideEmptyRows?: boolean;
    deduplicateAllDay?: boolean;
    constrainEvents?: boolean;
  };
  dayView?: {
    maxTime?: string;
    hideEmptyRows?: boolean;
    constrainEvents?: boolean;
  };
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
  disablePopups?: boolean;
  maxTime?: string;
  hideEmptyRows?: boolean;
  deduplicateAllDay?: boolean;
  constrainEvents?: boolean;
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
  dimensions,
  disablePopups = false,
  maxTime = "23:00",
  hideEmptyRows = true,
  deduplicateAllDay = true,
  constrainEvents = true
}) => {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [eventToShare, setEventToShare] = useState<Event | null>(null);
  const [viewLoadError, setViewLoadError] = useState<string | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  // Track dialog state with refs for better state handling
  const inviteDialogOpenRef = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
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
    filterEvents,
    retryDataFetch
  } = useCalendarEvents();
  
  const {
    shareEvent,
    recordRSVP
  } = useCalendarSharing();
  
  // Ensure refs are updated with latest values
  useEffect(() => {
    inviteDialogOpenRef.current = shareDialogOpen;
  }, [shareDialogOpen]);
  
  // Auto retry on network reconnection
  useEffect(() => {
    const handleOnline = () => retryDataFetch();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [retryDataFetch]);
  
  // Show loading state when changing views
  useEffect(() => {
    setLoadingView(true);
    const timer = setTimeout(() => setLoadingView(false), 300);
    return () => clearTimeout(timer);
  }, [viewMode]);
  
  // Initialize scroll position based on view
  useEffect(() => {
    if (contentRef.current) {
      const hourHeight = dimensions.minCellHeight || 60; // pixels per hour
      const startHour = 8; // 8 AM
      setTimeout(() => {
        contentRef.current?.scrollTo(0, startHour * hourHeight);
      }, 300);
    }
  }, [viewMode, dimensions.minCellHeight]);
  
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;
  
  // Use memoized filtered events for better performance
  const filteredEvents = useMemo(() => {
    return filterEvents(searchTerm);
  }, [filterEvents, searchTerm]);
  
  // Apply event constraints if needed
  const constrainedEvents = useMemo(() => {
    if (!constrainEvents) return filteredEvents;
    
    // Function to constrain event end times
    const constrainEventsFunc = (events: Event[], maxTimeStr: string): Event[] => {
      const [hours, minutes] = maxTimeStr.split(':').map(Number);
      const maxHour = hours || 23;
      const maxMinute = minutes || 0;
      
      return events.map(event => {
        // Don't modify all-day events
        if (event.allDay) return event;
        
        // Clone the event to avoid mutations
        const newEvent = { ...event };
        
        // Only constrain if the end time is after max time
        if (newEvent.endDate.getHours() > maxHour || 
            (newEvent.endDate.getHours() === maxHour && 
             newEvent.endDate.getMinutes() > maxMinute)) {
          
          // Create a new end date at the max time on the same day
          const constrainedEnd = new Date(newEvent.endDate);
          constrainedEnd.setHours(maxHour, maxMinute, 0, 0);
          newEvent.endDate = constrainedEnd;
        }
        
        return newEvent;
      });
    };
    
    return constrainEventsFunc(filteredEvents, maxTime);
  }, [filteredEvents, constrainEvents, maxTime]);

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
    if (disablePopups) return;
    
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
  }, [disablePopups]);

  const handleShareEvent = useCallback((event: Event) => {
    if (disablePopups) return;
    
    try {
      setEventToShare(event);
      setShareDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening share dialog:", err);
      setViewLoadError("Failed to open sharing options. Please try again.");
    }
  }, [disablePopups]);

  const handleRSVP = useCallback((event: Event) => {
    if (disablePopups) return;
    
    try {
      setEventToShare(event);
      setRsvpDialogOpen(true);
    } catch (err) {
      console.error("[ERROR] CalendarView - Error opening RSVP dialog:", err);
      setViewLoadError("Failed to open RSVP options. Please try again.");
    }
  }, [disablePopups]);

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

  // Create calendar config object for view-specific settings
  const calendarConfig: CalendarConfig = {
    weekView: {
      maxTime: maxTime,
      hideEmptyRows: hideEmptyRows,
      deduplicateAllDay: deduplicateAllDay,
      constrainEvents: constrainEvents
    },
    dayView: {
      maxTime: maxTime,
      hideEmptyRows: hideEmptyRows,
      constrainEvents: constrainEvents
    }
  };

  if (isLoading || loadingView) {
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
        <Button onClick={retryDataFetch}>Reload Calendar</Button>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className={cn(
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
      
      {!disablePopups && (
        <>
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
        </>
      )}
      
      {!isFileUploaderOpen && (
        <ErrorBoundary>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            {viewMode === 'month' && (
              <MonthView
                date={date}
                setDate={() => {}}
                events={constrainedEvents}
                handleViewEvent={disablePopups ? () => {} : handleViewEvent}
                theme={theme}
                weekStartsOn={weekStartsOn}
                minCellHeight={dimensions.minCellHeight}
                disablePopups={disablePopups}
              />
            )}
            
            {viewMode === 'week' && (
              <WeekView
                date={date}
                setDate={() => {}}
                events={constrainedEvents}
                handleViewEvent={disablePopups ? () => {} : handleViewEvent}
                theme={theme}
                weekStartsOn={weekStartsOn}
                minCellHeight={dimensions.minCellHeight}
                timeColumnWidth={dimensions.timeWidth}
                maxTime={maxTime}
                hideEmptyRows={hideEmptyRows}
                deduplicateAllDay={deduplicateAllDay}
                constrainEvents={constrainEvents}
                disablePopups={disablePopups}
              />
            )}
            
            {viewMode === 'day' && (
              <DayView
                date={date}
                events={constrainedEvents}
                handleViewEvent={disablePopups ? () => {} : handleViewEvent}
                theme={theme}
                minCellHeight={dimensions.minCellHeight}
                timeColumnWidth={dimensions.timeWidth}
                maxTime={maxTime}
                hideEmptyRows={hideEmptyRows}
                constrainEvents={constrainEvents}
                disablePopups={disablePopups}
              />
            )}
            
            {viewMode === 'agenda' && (
              <AgendaView
                date={date}
                setDate={() => {}}
                events={constrainedEvents}
                handleViewEvent={disablePopups ? () => {} : handleViewEvent}
                theme={theme}
                itemHeight={dimensions.minCellHeight}
                disablePopups={disablePopups}
              />
            )}
          </div>
        </ErrorBoundary>
      )}
      
      {/* Add responsive styles for mobile */}
      <style>
        {`
        @media (max-width: 768px) {
          .week-header {
            overflow-x: auto;
          }
        }
        `}
      </style>
    </div>
  );
};

export default CalendarView;
