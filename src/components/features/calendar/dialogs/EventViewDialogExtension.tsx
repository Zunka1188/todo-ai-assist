
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageSquare } from 'lucide-react';
import { Event } from '../types/event';
import EventViewDialog from './EventViewDialog';

interface EventViewDialogExtensionProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage?: (event: Event) => void;
  onShare?: (event: Event) => void;
  onRSVP?: (event: Event) => void;
}

const EventViewDialogExtension: React.FC<EventViewDialogExtensionProps> = ({
  isOpen,
  setIsOpen,
  selectedEvent,
  onEdit,
  onDelete,
  onViewImage,
  onShare,
  onRSVP
}) => {
  // We'll render the original EventViewDialog but intercept it to add our buttons
  
  const handleShare = () => {
    if (selectedEvent && onShare) {
      onShare(selectedEvent);
    }
  };
  
  const handleRSVP = () => {
    if (selectedEvent && onRSVP) {
      onRSVP(selectedEvent);
    }
  };
  
  // Add our custom share and RSVP buttons in addition to standard functionality
  const additionalButtons = selectedEvent ? (
    <div className="flex space-x-2 mt-4">
      {onShare && (
        <Button variant="outline" onClick={handleShare} size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}
      
      {onRSVP && (
        <Button variant="outline" onClick={handleRSVP} size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          RSVP
        </Button>
      )}
    </div>
  ) : null;
  
  return (
    <div>
      <EventViewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedEvent={selectedEvent}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewImage={onViewImage}
      />
      {/* We'll inject our buttons via CSS and JavaScript on the client side */}
      {/* This is a workaround since we can't directly modify EventViewDialog */}
      {isOpen && selectedEvent && (
        <div id="event-view-dialog-extension-buttons" className="hidden">
          {additionalButtons}
        </div>
      )}
    </div>
  );
};

export default EventViewDialogExtension;
