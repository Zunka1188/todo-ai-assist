
import { useState, useCallback, useEffect } from 'react';
import { ViewMode } from '../CalendarContext';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface UseCalendarStateProps {
  initialView?: ViewMode;
}

export const useCalendarState = ({ initialView = 'day' }: UseCalendarStateProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  
  const { toast } = useToast();

  // Load calendar data
  useEffect(() => {
    let isMounted = true;
    
    const loadCalendarData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = "Failed to load calendar data. Please try again.";
          logger.error("[Calendar] Failed to load calendar data", error);
          setPageError(errorMessage);
          setIsLoading(false);
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
            role: "alert",
            "aria-live": "assertive"
          });
        }
      }
    };

    loadCalendarData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [toast]);
  
  const retryDataFetch = useCallback(() => {
    setPageError(null);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Success",
        description: "Calendar data refreshed successfully",
        role: "status",
        "aria-live": "polite"
      });
    }, 1000);
  }, [toast]);

  // Modified view mode change handler without toast
  const handleViewModeChange = useCallback((value: ViewMode) => {
    if (viewMode !== value) {
      setViewMode(value);
    }
  }, [viewMode]);

  return {
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode: handleViewModeChange,
    currentDate,
    setCurrentDate,
    createDialogOpen,
    setCreateDialogOpen,
    showFileUploader,
    setShowFileUploader,
    inviteDialogOpen,
    setInviteDialogOpen,
    isLoading,
    setIsLoading,
    pageError,
    setPageError,
    isAddingEvent,
    setIsAddingEvent: setIsAddingEvent,
    isInviting,
    setIsInviting,
    retryDataFetch
  };
};
