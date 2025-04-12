
import React from 'react';
import { CalendarIcon, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import CalendarDatePicker from './calendar/CalendarDatePicker';
import CalendarWidgetContent from './calendar/CalendarWidgetContent';
import { useCalendarWidget } from './calendar/useCalendarWidget';
import EventViewDialog from '../features/calendar/dialogs/EventViewDialog';

const CalendarWidget = () => {
  const {
    date,
    open,
    setOpen,
    selectedEvent,
    setSelectedEvent,
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
        <div className="flex items-center justify-between p-4 pb-0">
          <CalendarDatePicker 
            date={date}
            formattedDate={formattedDate}
            handleSelect={handleSelect}
            open={open}
            setOpen={setOpen}
          />
          <Button variant="ghost" size="icon" asChild className="ml-auto">
            <Link to="/calendar">
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
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
