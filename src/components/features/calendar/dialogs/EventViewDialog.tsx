import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, ImagePlus, X, Share2, MessageSquare } from 'lucide-react';
import { Event } from '../types/event';

interface EventViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage?: (event: Event) => void;
  onShare?: (event: Event) => void;
  onRSVP?: (event: Event) => void;
}

const EventViewDialog: React.FC<EventViewDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedEvent,
  onEdit,
  onDelete,
  onViewImage,
  onShare,
  onRSVP
}) => {
  if (!selectedEvent) return null;

  const formatEventTime = () => {
    if (selectedEvent.allDay) {
      return "All day";
    } else {
      return `${format(selectedEvent.startDate, 'h:mm a')} - ${format(selectedEvent.endDate, 'h:mm a')}`;
    }
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare(selectedEvent);
    }
  };
  
  const handleRSVP = () => {
    if (onRSVP) {
      onRSVP(selectedEvent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{selectedEvent.title}</DialogTitle>
          <DialogDescription>
            {format(selectedEvent.startDate, 'EEEE, MMMM d, yyyy')}
            <br />
            {formatEventTime()}
            {selectedEvent.location && (
              <>
                <br />
                <MapPin className="inline-block h-3 w-3 mr-1" />
                {selectedEvent.location}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {selectedEvent.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
            </div>
          )}

          {selectedEvent.image && onViewImage && (
            <div>
              <Button variant="outline" className="w-full" onClick={() => onViewImage(selectedEvent)}>
                <ImagePlus className="mr-2 h-4 w-4" />
                View Image
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleRSVP}>
            <MessageSquare className="mr-2 h-4 w-4" />
            RSVP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventViewDialog;
