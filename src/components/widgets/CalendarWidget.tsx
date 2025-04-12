
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WidgetWrapper } from './shared/WidgetWrapper';
import CalendarDatePicker from './calendar/CalendarDatePicker';
import CalendarWidgetContent from './calendar/CalendarWidgetContent';
import { useCalendarWidget } from './calendar/useCalendarWidget';
import EventViewDialog from '../features/calendar/dialogs/EventViewDialog';
import EventFormDialog from '../features/calendar/dialogs/EventFormDialog';

const CalendarWidget = () => {
  const {
    date,
    open,
    setOpen,
    selectedEvent,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isEditMode,
    isLoading,
    error,
    eventsForToday,
    formattedDate,
    handleSelect,
    handleEventClick,
    handleViewToEdit,
    handleCloseEventDialog
  } = useCalendarWidget();

  return (
    <WidgetWrapper
      title="Calendar"
      icon={<CalendarIcon className="h-4 w-4" />}
      linkTo="/calendar"
      className="h-full"
    >
      <div className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CalendarDatePicker 
              date={date}
              formattedDate={formattedDate}
              handleSelect={handleSelect}
              open={open}
              setOpen={setOpen}
            />
          </div>
        </div>

        <CalendarWidgetContent 
          isLoading={isLoading}
          error={error}
          events={eventsForToday}
          handleEventClick={handleEventClick}
        />
      </div>

      {selectedEvent && (
        <EventViewDialog
          isOpen={isViewDialogOpen}
          setIsOpen={setIsViewDialogOpen}
          selectedEvent={selectedEvent}
          onEdit={handleViewToEdit}
          onDelete={() => {
            setIsViewDialogOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </WidgetWrapper>
  );
};

export default CalendarWidget;
