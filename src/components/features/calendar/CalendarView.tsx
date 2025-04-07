
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/day-view';
import AgendaView from './views/AgendaView';
import EventFormDialog from './dialogs/EventFormDialog';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarSharing } from './hooks/useCalendarSharing';
import FileUploader from '../scanning/FileUploader';
import ShareButton from '../shared/ShareButton';
import FullScreenPreview from '../documents/FullScreenPreview';
import InviteDialog from './dialogs/InviteDialog';
import RSVPDialog from './dialogs/RSVPDialog';
import { Event } from './types/event';
import EventViewDialogExtension from './dialogs/EventViewDialogExtension';

interface CalendarViewProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  searchTerm?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isCreateDialogOpen?: boolean;
  setIsCreateDialogOpen?: (open: boolean) => void;
  isFileUploaderOpen?: boolean;
  setIsFileUploaderOpen?: (open: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewMode,
  searchTerm = '',
  weekStartsOn = 1,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isFileUploaderOpen = false,
  setIsFileUploaderOpen = () => {}
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [eventToShare, setEventToShare] = useState<Event | null>(null);
  
  const {
    events,
    selectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    setIsEditMode,
    isCreateDialogOpen: localCreateDialogOpen,
    setIsCreateDialogOpen: setLocalCreateDialogOpen,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCreateEvent,
    handleSaveEvent,
    filterEvents
  } = useCalendarEvents();
  
  const {
    shareEvent,
    recordRSVP
  } = useCalendarSharing();
  
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;
  
  const filteredEvents = filterEvents(searchTerm);

  const handleViewToEdit = () => {
    setIsViewDialogOpen(false);
    setIsEditMode(true);
    setTimeout(() => {
      effectiveSetCreateDialogOpen(true);
    }, 100);
  };

  const handleFileUploadSuccess = (data: any) => {
    setIsFileUploaderOpen(false);
    
    const newEvent = {
      id: `event-${Date.now()}`,
      title: data.title || 'Event from file',
      description: data.description || '',
      startDate: data.date ? new Date(data.date) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 3600000),
      location: data.location || '',
      color: data.color || '#4285F4',
      allDay: false,
      reminder: '30',
      image: data.file || data.content || null,
    };
    
    handleSaveEvent(newEvent);
  };
  
  const handleOpenImagePreview = (event: any) => {
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
  };

  // Handle sharing an event
  const handleShareEvent = (event: Event) => {
    setEventToShare(event);
    setShareDialogOpen(true);
  };

  // Handle RSVP for an event
  const handleRSVP = (event: Event) => {
    setEventToShare(event);
    setRsvpDialogOpen(true);
  };

  // Submit RSVP response
  const submitRSVP = (status: 'yes' | 'no' | 'maybe', name: string) => {
    if (!eventToShare) return;
    recordRSVP(eventToShare.id, name, status);
  };

  // Handle share link generation
  const handleShareLink = (link: string) => {
    console.log("Share link generated:", link);
    // Additional logic if needed
  };

  return (
    <div className={cn(
      "space-y-4 w-full mx-auto max-w-[100%]",
      isMobile ? "pb-2" : ""
    )}>
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

      {/* Share Dialog */}
      <InviteDialog
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        event={eventToShare}
        onShareLink={handleShareLink}
      />
      
      {/* RSVP Dialog */}
      <RSVPDialog
        isOpen={rsvpDialogOpen}
        setIsOpen={setRsvpDialogOpen}
        event={eventToShare}
        onRSVP={submitRSVP}
      />
      
      {!isFileUploaderOpen && (
        <>
          {viewMode === 'month' && (
            <MonthView
              date={date}
              setDate={setDate}
              events={filteredEvents}
              handleViewEvent={handleViewEvent}
              theme={theme}
              weekStartsOn={weekStartsOn}
            />
          )}
          
          {viewMode === 'week' && (
            <WeekView
              date={date}
              setDate={setDate}
              events={filteredEvents}
              handleViewEvent={handleViewEvent}
              theme={theme}
              weekStartsOn={weekStartsOn}
            />
          )}
          
          {viewMode === 'day' && (
            <DayView
              date={date}
              setDate={setDate}
              events={filteredEvents}
              handleViewEvent={handleViewEvent}
              theme={theme}
            />
          )}
          
          {viewMode === 'agenda' && (
            <AgendaView
              date={date}
              setDate={setDate}
              events={filteredEvents}
              handleViewEvent={handleViewEvent}
              theme={theme}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CalendarView;
