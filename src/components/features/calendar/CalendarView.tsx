
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/day-view';
import AgendaView from './views/AgendaView';
import EventViewDialog from './dialogs/EventViewDialog';
import EventFormDialog from './dialogs/EventFormDialog';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import FileUploader from '../scanning/FileUploader';
import ShareButton from '../shared/ShareButton';

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

  return (
    <div className={cn(
      "space-y-4 w-full", 
      isMobile ? "px-2 pb-2" : ""
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
      
      <EventViewDialog
        isOpen={isViewDialogOpen && !isFileUploaderOpen}
        setIsOpen={setIsViewDialogOpen}
        selectedEvent={selectedEvent}
        onEdit={handleViewToEdit}
        onDelete={handleDeleteEvent}
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
