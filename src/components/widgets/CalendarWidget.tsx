
import React, { useState } from 'react';
import { CalendarIcon, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import CalendarDatePicker from './calendar/CalendarDatePicker';
import CalendarWidgetContent from './calendar/CalendarWidgetContent';
import { useCalendarWidget } from './calendar/useCalendarWidget';
import EventViewDialog from '../features/calendar/dialogs/EventViewDialog';
import RSVPDialog from '../features/calendar/dialogs/RSVPDialog';
import { Event, RSVPType } from '../features/calendar/types/event';

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

  // RSVP state
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);
  const [existingRSVP, setExistingRSVP] = useState<RSVPType | undefined>(undefined);

  // Handle opening RSVP dialog
  const handleOpenRSVP = (event: Event) => {
    // Check if user has already RSVP'd (in real app, use actual user ID)
    const mockUserId = "current-user";
    const existingResponse = event.rsvp?.find(r => r.userId === mockUserId);
    setExistingRSVP(existingResponse);
    
    setIsRSVPDialogOpen(true);
  };
  
  // Handle RSVP submission
  const handleRSVP = (eventId: string, userId: string, name: string, status: RSVPType['status'], comment?: string) => {
    if (!selectedEvent) return;
    
    // In a real app, this would call an API to store the RSVP
    console.log(`RSVP submitted for ${eventId}: ${name} - ${status}`);
    
    // For demo purposes, we'll just close the dialog
    setIsRSVPDialogOpen(false);
  };

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
        <>
          <EventViewDialog
            isOpen={isViewDialogOpen}
            setIsOpen={setIsViewDialogOpen}
            selectedEvent={selectedEvent}
            onEdit={handleViewToEdit}
            onDelete={() => {
              setIsViewDialogOpen(false);
              setSelectedEvent(null);
            }}
            onRSVP={() => handleOpenRSVP(selectedEvent)}
          />
          
          <RSVPDialog
            isOpen={isRSVPDialogOpen}
            setIsOpen={setIsRSVPDialogOpen}
            event={selectedEvent}
            onRSVP={handleRSVP}
            existingRSVP={existingRSVP}
          />
        </>
      )}
    </WidgetWrapper>
  );
};

export default CalendarWidget;
