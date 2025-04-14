
import React, { useState } from 'react';
import { CalendarIcon, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import CalendarDatePicker from './calendar/CalendarDatePicker';
import CalendarWidgetContent from './calendar/CalendarWidgetContent';
import { useCalendarWidget } from './calendar/useCalendarWidget';
import EventViewDialogExtension from '../features/calendar/dialogs/EventViewDialogExtension';
import { Event, RSVPType } from '../features/calendar/types/event';
import InviteDialog from '../features/calendar/dialogs/InviteDialog';
import { useToast } from '@/hooks/use-toast';

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

  // Share state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();

  // Handle event sharing
  const handleShareEvent = (event: Event) => {
    if (event) {
      setIsShareDialogOpen(true);
    }
  };

  // Handle share link generation
  const handleShareLink = (link: string) => {
    console.log(`Share link created: ${link}`);
    toast({
      title: "Share link created",
      description: "The link has been copied to clipboard"
    });
    setIsShareDialogOpen(false);
  };
  
  // Handle RSVP
  const handleRSVP = (eventId: string, userId: string, name: string, status: RSVPType['status'], comment?: string) => {
    console.log(`RSVP submitted for ${eventId}: ${name} - ${status}`);
    toast({
      title: "RSVP Submitted",
      description: `Your response: ${status.toUpperCase()}`
    });
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
          <EventViewDialogExtension
            isOpen={isViewDialogOpen}
            setIsOpen={setIsViewDialogOpen}
            selectedEvent={selectedEvent}
            onEdit={handleViewToEdit}
            onDelete={() => {
              setIsViewDialogOpen(false);
              setSelectedEvent(null);
            }}
            onRSVP={handleShareEvent}
            onShare={handleShareEvent}
          />
          
          <InviteDialog
            isOpen={isShareDialogOpen}
            setIsOpen={setIsShareDialogOpen}
            event={selectedEvent}
            onShareLink={handleShareLink}
          />
        </>
      )}
    </WidgetWrapper>
  );
};

export default CalendarWidget;
