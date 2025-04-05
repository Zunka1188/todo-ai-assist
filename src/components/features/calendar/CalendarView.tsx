
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import AgendaView from './views/AgendaView';
import EventViewDialog from './dialogs/EventViewDialog';
import EventFormDialog from './dialogs/EventFormDialog';
import { useCalendarEvents } from './hooks/useCalendarEvents';

interface CalendarViewProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  searchTerm?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isCreateDialogOpen?: boolean;
  setIsCreateDialogOpen?: (open: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewMode,
  searchTerm = '',
  weekStartsOn = 1,
  isCreateDialogOpen,
  setIsCreateDialogOpen
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

  return (
    <div className="space-y-4">
      {/* Event Form Dialog */}
      <EventFormDialog
        isOpen={effectiveCreateDialogOpen}
        setIsOpen={effectiveSetCreateDialogOpen}
        onSubmit={handleSaveEvent}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
      />
      
      {/* Event View Dialog */}
      <EventViewDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        selectedEvent={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
      
      {/* Calendar views */}
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
    </div>
  );
};

export default CalendarView;
