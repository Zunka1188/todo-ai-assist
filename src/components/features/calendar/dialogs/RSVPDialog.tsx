
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, HelpCircle } from 'lucide-react';
import { Event } from '../types/event';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RSVPDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event: Event | null;
  onRSVP: (status: 'yes' | 'no' | 'maybe', name: string) => void;
}

const RSVPDialog: React.FC<RSVPDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  onRSVP
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const { toast } = useToast();

  const handleSubmitRSVP = (status: 'yes' | 'no' | 'maybe') => {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }

    onRSVP(status, name.trim());
    setIsOpen(false);
    
    const statusMessages = {
      yes: "You're attending!",
      no: "You declined this invitation",
      maybe: "You might attend this event"
    };
    
    toast({
      title: "RSVP Submitted",
      description: statusMessages[status]
    });
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
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Will you attend?</p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center py-6 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                onClick={() => handleSubmitRSVP('yes')}
              >
                <Check className="h-6 w-6 mb-2 text-green-600" />
                <span>Yes</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center py-6 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                onClick={() => handleSubmitRSVP('no')}
              >
                <X className="h-6 w-6 mb-2 text-red-600" />
                <span>No</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center py-6 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                onClick={() => handleSubmitRSVP('maybe')}
              >
                <HelpCircle className="h-6 w-6 mb-2 text-yellow-600" />
                <span>Maybe</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RSVPDialog;
