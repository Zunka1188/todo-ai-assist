
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, HelpCircle, Users, Loader2 } from 'lucide-react';
import { Event } from '../types/event';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RSVPDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event: Event | null;
  onRSVP: (status: 'yes' | 'no' | 'maybe', name: string) => void;
}

interface Attendee {
  name: string;
  response: 'yes' | 'no' | 'maybe';
  timestamp: Date;
}

const RSVPDialog: React.FC<RSVPDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  onRSVP
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setNameError('');
      setSelectedStatus(null);
      setShowAttendees(false);
      
      // Example: Load attendees data when dialog opens
      if (event) {
        loadAttendees();
      }
    }
  }, [isOpen, event]);

  // Simulate loading attendees data
  const loadAttendees = async () => {
    if (!event) return;
    
    try {
      setIsLoadingAttendees(true);
      
      // Simulate API call to get attendees
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Example attendee data - in a real app, this would come from your API
      const mockAttendees: Attendee[] = [
        { name: "Alex Johnson", response: "yes", timestamp: new Date() },
        { name: "Sam Lee", response: "no", timestamp: new Date() },
        { name: "Taylor Smith", response: "maybe", timestamp: new Date() }
      ];
      
      setAttendees(mockAttendees);
    } catch (error) {
      console.error('[ERROR] Failed to load attendees:', error);
      toast({
        title: "Error",
        description: "Failed to load attendee information",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  // Handle RSVP selection
  const handleStatusSelect = (status: 'yes' | 'no' | 'maybe') => {
    setSelectedStatus(status);
  };

  // Handle final RSVP submission
  const handleSubmitRSVP = async () => {
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
      
      // Submit RSVP response
      onRSVP(selectedStatus, name.trim());
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsOpen(false);
      
      const statusMessages = {
        yes: "You're attending!",
        no: "You declined this invitation",
        maybe: "You might attend this event"
      };
      
      toast({
        title: "RSVP Submitted",
        description: statusMessages[selectedStatus],
      });
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

  // Toggle attendee list visibility
  const toggleAttendees = () => {
    setShowAttendees(!showAttendees);
    if (!showAttendees && attendees.length === 0) {
      loadAttendees();
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

  // Count responses by type
  const responseCount = {
    yes: attendees.filter(a => a.response === 'yes').length,
    no: attendees.filter(a => a.response === 'no').length,
    maybe: attendees.filter(a => a.response === 'maybe').length
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

          {/* Attendee List Toggle Button */}
          <Button 
            variant="ghost" 
            className="w-full border flex justify-between items-center"
            onClick={toggleAttendees}
            disabled={isSubmitting}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>View Attendees</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {responseCount.yes} Yes · {responseCount.no} No · {responseCount.maybe} Maybe
            </div>
          </Button>

          {/* Attendee List Panel */}
          {showAttendees && (
            <div className="border rounded-md p-3 mt-2 bg-muted/20 max-h-40 overflow-y-auto">
              {isLoadingAttendees ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading attendees...</p>
                </div>
              ) : attendees.length > 0 ? (
                <div className="space-y-2">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{attendee.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        attendee.response === 'yes' && "bg-green-100 text-green-800",
                        attendee.response === 'no' && "bg-red-100 text-red-800",
                        attendee.response === 'maybe' && "bg-yellow-100 text-yellow-800"
                      )}>
                        {attendee.response}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-2">No attendees yet</p>
              )}
            </div>
          )}

          <Button 
            variant="default" 
            className="w-full mt-4 bg-primary"
            onClick={handleSubmitRSVP}
            disabled={isSubmitting || !selectedStatus}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
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
