
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, HelpCircle, Users } from 'lucide-react';
import { Event, RSVPType } from '../types/event';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface RSVPDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event: Event | null;
  onRSVP: (eventId: string, userId: string, name: string, status: RSVPType['status'], comment?: string) => void;
  existingRSVP?: RSVPType;
}

const RSVPDialog: React.FC<RSVPDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  onRSVP,
  existingRSVP
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RSVPType['status'] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens or event changes
  useEffect(() => {
    if (isOpen && event) {
      // If user has already RSVP'd, pre-fill the form
      if (existingRSVP) {
        setName(existingRSVP.name);
        setSelectedStatus(existingRSVP.status);
        setComment(existingRSVP.comment || '');
      } else {
        setName('');
        setSelectedStatus(null);
        setComment('');
      }
      setNameError('');
    }
  }, [isOpen, event, existingRSVP]);

  // Handle RSVP selection
  const handleStatusSelect = (status: RSVPType['status']) => {
    setSelectedStatus(status);
  };

  // Handle final RSVP submission
  const handleSubmitRSVP = async () => {
    if (!event) return;
    
    if (!selectedStatus) {
      toast({
        title: "Missing Selection",
        description: "Please select if you'll attend this event",
        variant: "destructive",
      });
      return;
    }
    
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In a real app, you'd get the actual userId from authentication
      const userId = existingRSVP?.userId || uuidv4();
      
      // Submit RSVP response
      onRSVP(event.id, userId, name.trim(), selectedStatus, comment.trim() || undefined);
      
      // Close dialog after successful submission
      setIsOpen(false);
    } catch (error) {
      console.error('[ERROR] Failed to submit RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to submit your RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  const formatEventTime = () => {
    if (event.allDay) {
      return "All day";
    } else {
      return `${format(event.startDate, 'h:mm a')} - ${format(event.endDate, 'h:mm a')}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            {format(event.startDate, 'EEEE, MMMM d, yyyy')}
            <br />
            {formatEventTime()}
            {event.location && (
              <>
                <br />
                Location: {event.location}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Your Name</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              placeholder="Enter your name"
              className={nameError ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Will you attend?</p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedStatus === 'yes' ? "default" : "outline"}
                className={cn(
                  "flex flex-col items-center py-6",
                  selectedStatus === 'yes' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                )}
                onClick={() => handleStatusSelect('yes')}
                disabled={isSubmitting}
              >
                <Check className={cn(
                  "h-6 w-6 mb-2",
                  selectedStatus === 'yes' ? "text-white" : "text-green-600"
                )} />
                <span>Yes</span>
              </Button>
              
              <Button 
                variant={selectedStatus === 'no' ? "default" : "outline"}
                className={cn(
                  "flex flex-col items-center py-6",
                  selectedStatus === 'no' 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                )}
                onClick={() => handleStatusSelect('no')}
                disabled={isSubmitting}
              >
                <X className={cn(
                  "h-6 w-6 mb-2",
                  selectedStatus === 'no' ? "text-white" : "text-red-600"
                )} />
                <span>No</span>
              </Button>
              
              <Button 
                variant={selectedStatus === 'maybe' ? "default" : "outline"}
                className={cn(
                  "flex flex-col items-center py-6",
                  selectedStatus === 'maybe' 
                    ? "bg-yellow-500 hover:bg-yellow-600" 
                    : "hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                )}
                onClick={() => handleStatusSelect('maybe')}
                disabled={isSubmitting}
              >
                <HelpCircle className={cn(
                  "h-6 w-6 mb-2",
                  selectedStatus === 'maybe' ? "text-white" : "text-yellow-600"
                )} />
                <span>Maybe</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={handleSubmitRSVP}
            disabled={isSubmitting || !selectedStatus}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                Submitting...
              </>
            ) : existingRSVP ? (
              'Update Response'
            ) : (
              'Submit Response'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RSVPDialog;
