
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseCalendarDialogsProps {
  setCreateDialogOpen: (open: boolean) => void;
  setShowFileUploader: (open: boolean) => void;
  setIsAddingEvent: (adding: boolean) => void;
  setInviteDialogOpen: (open: boolean) => void;
  setIsInviting: (inviting: boolean) => void;
}

export const useCalendarDialogs = ({
  setCreateDialogOpen,
  setShowFileUploader,
  setIsAddingEvent,
  setInviteDialogOpen,
  setIsInviting
}: UseCalendarDialogsProps) => {
  const { toast } = useToast();
  
  const handleAddItem = useCallback(() => {
    setCreateDialogOpen(true);
    setShowFileUploader(false);
    setIsAddingEvent(true);
  }, [setCreateDialogOpen, setShowFileUploader, setIsAddingEvent]);

  const handleDialogClose = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setIsAddingEvent(false);
      // Improve focus management for accessibility
      setTimeout(() => {
        document.getElementById('add-event-button')?.focus();
      }, 0);
    }
  }, [setCreateDialogOpen, setIsAddingEvent]);

  const handleFileUploaderChange = useCallback((open: boolean) => {
    setShowFileUploader(open);
  }, [setShowFileUploader]);
  
  const handleShareCalendar = useCallback(() => {
    setInviteDialogOpen(true);
    setIsInviting(true);
  }, [setInviteDialogOpen, setIsInviting]);

  const handleInviteSent = useCallback((link: string) => {
    setInviteDialogOpen(false);
    setIsInviting(false);
    
    toast({
      title: "Invitation Link Generated",
      description: "The link has been created and is ready to share",
      role: "status",
      "aria-live": "polite"
    });
  }, [toast, setInviteDialogOpen, setIsInviting]);

  return {
    handleAddItem,
    handleDialogClose,
    handleFileUploaderChange,
    handleShareCalendar,
    handleInviteSent
  };
};
