
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageSquare } from 'lucide-react';
import { Event } from '../types/event';
import EventViewDialog from './EventViewDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import SocialShareMenu from '../../shared/SocialShareMenu';

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
  const { isMobile } = useIsMobile();
  const [actionButtonsVisible, setActionButtonsVisible] = useState(false);
  
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
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen && selectedEvent) {
      timer = setTimeout(() => {
        setActionButtonsVisible(true);
      }, 300);
    } else {
      setActionButtonsVisible(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, selectedEvent]);
  
  const renderActionButtons = () => {
    if (!actionButtonsVisible || !selectedEvent) return null;
    
    const buttonClasses = isMobile 
      ? "flex-1 shadow-md flex items-center justify-center py-3" 
      : "shadow-md";
    
    return (
      <TooltipProvider>
        <div className={`
          ${isMobile 
            ? "fixed bottom-0 left-0 right-0 flex w-full border-t bg-background p-2 z-50" 
            : "fixed bottom-20 right-6 flex flex-col space-y-2 z-50"
          }`}
        >
          {onShare && (
            <Tooltip>
              <TooltipTrigger asChild>
                {isMobile ? (
                  <Button 
                    variant="outline"  // Changed from "secondary" to "outline"
                    onClick={handleShare} 
                    size="lg" 
                    className={buttonClasses}
                    aria-label="Share event"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                ) : (
                  <SocialShareMenu
                    title={selectedEvent.title}
                    text={`Check out this event: ${selectedEvent.title}`}
                    buttonVariant="outline"  // Ensuring consistency
                    buttonSize="sm"
                    className={buttonClasses}
                    showLabel={true}
                  />
                )}
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "top" : "left"}>
                Share this event with others
              </TooltipContent>
            </Tooltip>
          )}
          
          {onRSVP && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"  // Changed from "secondary" to "outline"
                  onClick={handleRSVP} 
                  size={isMobile ? "lg" : "sm"} 
                  className={buttonClasses}
                  aria-label="RSVP to event"
                >
                  <MessageSquare className={`h-4 w-4 ${isMobile ? "mr-2" : "mr-2"}`} />
                  RSVP
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "top" : "left"}>
                Respond to this event invitation
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };
  
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
      
      {renderActionButtons()}
    </div>
  );
};

export default EventViewDialogExtension;
