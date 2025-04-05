
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import AgendaView from './views/AgendaView';
import EventViewDialog from './dialogs/EventViewDialog';
import EventFormDialog from './dialogs/EventFormDialog';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import FileUploader from '../scanning/FileUploader';

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
  
  // Use externally controlled dialog state if provided
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;
  
  // Filter events based on search term
  const filteredEvents = filterEvents(searchTerm);

  // Handle closing view dialog and opening edit dialog
  const handleViewToEdit = () => {
    setIsViewDialogOpen(false);
    setIsEditMode(true);
    setTimeout(() => {
      effectiveSetCreateDialogOpen(true);
    }, 100); // Small delay to ensure dialogs don't conflict
  };

  const handleFileUploadSuccess = (data: any) => {
    // Close file uploader
    setIsFileUploaderOpen(false);
    
    // Create a new event from file data
    const newEvent = {
      id: `event-${Date.now()}`,
      title: data.title || 'Event from file',
      description: data.description || '',
      startDate: data.date ? new Date(data.date) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 3600000), // Default 1 hour
      location: data.location || '',
      color: data.color || '#4285F4',
      allDay: false,
      reminder: '30',
      image: data.file || data.content || null,
    };
    
    handleSaveEvent(newEvent);
  };

  return (
    <div className="space-y-4 w-full">
      {/* File Uploader */}
      {isFileUploaderOpen && (
        <FileUploader
          onClose={() => setIsFileUploaderOpen(false)}
          onSaveSuccess={handleFileUploadSuccess}
        />
      )}
      
      {/* Event Form Dialog */}
      <EventFormDialog
        isOpen={(effectiveCreateDialogOpen || isEditMode) && !isFileUploaderOpen && !isViewDialogOpen}
        setIsOpen={(open) => {
          effectiveSetCreateDialogOpen(open);
          if (!open) setIsEditMode(false);
        }}
        onSubmit={handleSaveEvent}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
      />
      
      {/* Event View Dialog */}
      <EventViewDialog
        isOpen={isViewDialogOpen && !isFileUploaderOpen}
        setIsOpen={setIsViewDialogOpen}
        selectedEvent={selectedEvent}
        onEdit={handleViewToEdit}
        onDelete={handleDeleteEvent}
      />
      
      {/* Calendar views */}
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
