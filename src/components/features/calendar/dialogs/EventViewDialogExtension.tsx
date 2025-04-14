
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageSquare } from 'lucide-react';
import { Event } from '../types/event';
import EventViewDialog from './EventViewDialog';

/**
 * Extension of the EventViewDialog component that adds share and RSVP functionality
 */
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
  // Handle sharing the event
  const handleShare = () => {
    if (selectedEvent && onShare) {
      onShare(selectedEvent);
    }
  };
  
  // Handle RSVP to the event
  const handleRSVP = () => {
    if (selectedEvent && onRSVP) {
      onRSVP(selectedEvent);
    }
  };
  
  // No need for custom DOM manipulation or client-side code injection
  // We can just render buttons directly in this component that will call our handlers
  
  return (
    <div>
      <EventViewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedEvent={selectedEvent}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewImage={onViewImage}
        onShare={handleShare}
        onRSVP={handleRSVP}
      />
      
      {/* We render these buttons separately to allow for customization without modifying EventViewDialog */}
      {isOpen && selectedEvent && (
        <div className="fixed bottom-20 right-6 flex flex-col space-y-2 z-50">
          {onShare && (
            <Button 
              variant="secondary" 
              onClick={handleShare} 
              size="sm" 
              className="shadow-md"
              aria-label="Share event"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          
          {onRSVP && (
            <Button 
              variant="secondary" 
              onClick={handleRSVP} 
              size="sm" 
              className="shadow-md"
              aria-label="RSVP to event"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              RSVP
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventViewDialogExtension;
