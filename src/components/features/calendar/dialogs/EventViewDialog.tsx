
import React, { useState } from 'react';
import { Event } from '../types/event';
import { format, isSameDay } from 'date-fns';
import { Clock, MapPin, Bell, FileText, Edit, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFormattedTime, getReminderLabel, weekDays } from '../utils/dateUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventViewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  onEdit: () => void;
  onDelete: () => void;
}

const EventViewDialog = ({ isOpen, setIsOpen, selectedEvent, onEdit, onDelete }: EventViewDialogProps) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const { isMobile } = useIsMobile();
  
  if (!selectedEvent) return null;

  const hasImage = !!selectedEvent.image;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[90vh]" preventNavigateOnClose hideCloseButton>
        <DialogHeader>
          <div className="flex justify-between items-center mb-1">
            <div className="w-3 h-3 rounded-full mr-2" style={{
              backgroundColor: selectedEvent.color
            }} />
            <DialogTitle className="flex-1 text-left">
              {selectedEvent.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Event details for {selectedEvent.title}
            </DialogDescription>
            <div className="flex space-x-1">
              {hasImage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setShowImagePreview(!showImagePreview)}
                    >
                      <Image className="h-4 w-4" />
                      <span className="sr-only">Toggle image preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showImagePreview ? 'Hide image' : 'Show image'}
                  </TooltipContent>
                </Tooltip>
              )}
              <Button variant="outline" size="icon" onClick={onEdit} className="h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit event</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 p-1">
            {selectedEvent.image && showImagePreview && (
              <div className="mb-4">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-48 object-cover rounded-md" />
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {selectedEvent.allDay ? 'All day' : `${getFormattedTime(selectedEvent.startDate)} - ${getFormattedTime(selectedEvent.endDate)}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedEvent.startDate, 'EEEE, MMMM d, yyyy')}
                  {!isSameDay(selectedEvent.startDate, selectedEvent.endDate) && <> - {format(selectedEvent.endDate, 'EEEE, MMMM d, yyyy')}</>}
                </p>
                {selectedEvent.recurring && <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Recurring: </span>
                    {selectedEvent.recurring.frequency.charAt(0).toUpperCase() + selectedEvent.recurring.frequency.slice(1)}
                    {selectedEvent.recurring.frequency === 'weekly' && selectedEvent.recurring.daysOfWeek && <span> on {selectedEvent.recurring.daysOfWeek.map(day => weekDays[day]).join(', ')}</span>}
                  </p>}
              </div>
            </div>
            
            {selectedEvent.location && <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p>{selectedEvent.location}</p>
                </div>
              </div>}
            
            {selectedEvent.reminder && selectedEvent.reminder !== 'none' && <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p>{getReminderLabel(selectedEvent.reminder)}</p>
                </div>
              </div>}
            
            {selectedEvent.description && <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              </div>}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Close</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex-1"
          >
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventViewDialog;
