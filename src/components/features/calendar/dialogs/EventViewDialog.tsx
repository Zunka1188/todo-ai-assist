
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, ImagePlus, Share2, MessageSquare } from 'lucide-react';
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
            <div className="flex items-center text-sm mb-1">
              <CalendarIcon className="inline-block h-3.5 w-3.5 mr-1.5" />
              {format(selectedEvent.startDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm mb-1">
              <Clock className="inline-block h-3.5 w-3.5 mr-1.5" />
              {formatEventTime()}
            </div>
            {selectedEvent.location && (
              <div className="flex items-center text-sm">
                <MapPin className="inline-block h-3.5 w-3.5 mr-1.5" />
                {selectedEvent.location}
              </div>
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
          
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleRSVP} className="w-full flex items-center justify-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              RSVP to this event
            </Button>
            
            <Button variant="outline" onClick={handleShare} className="w-full flex items-center justify-center">
              <Share2 className="mr-2 h-4 w-4" />
              Share event
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={onEdit}>
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventViewDialog;
