
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, ImagePlus, Share2, MessageSquare, Paperclip } from 'lucide-react';
import { Event, AttachmentType } from '../types/event';
import FilePreview from '../../documents/FilePreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const { isMobile } = useIsMobile();
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentType | null>(null);
  
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
  
  const handleViewAttachment = (attachment: AttachmentType) => {
    setSelectedAttachment(attachment);
    if (onViewImage && attachment.type === 'image') {
      // Create a temporary event with the attachment as the main image
      const tempEvent = {
        ...selectedEvent,
        image: attachment.url
      };
      onViewImage(tempEvent);
    }
  };

  const hasAttachments = selectedEvent.attachments && selectedEvent.attachments.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
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

        <ScrollArea className="max-h-[calc(90vh-12rem)]">
          <div className="space-y-4 py-4">
            {selectedEvent.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}

            {/* Display attachments if any */}
            {hasAttachments && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                  Attachments ({selectedEvent.attachments?.length})
                </p>
                <div className={cn(
                  "grid gap-2",
                  isMobile ? "grid-cols-2" : "grid-cols-3"
                )}>
                  {selectedEvent.attachments?.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="border rounded-md p-2 hover:bg-muted/50 transition cursor-pointer"
                      onClick={() => handleViewAttachment(attachment)}
                    >
                      <div className="aspect-square mb-2 flex items-center justify-center overflow-hidden bg-muted rounded-sm">
                        <FilePreview 
                          file={attachment.url}
                          fileName={attachment.name}
                          fileType={attachment.type}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs truncate text-center">{attachment.name}</p>
                    </div>
                  ))}
                </div>
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
        </ScrollArea>

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
