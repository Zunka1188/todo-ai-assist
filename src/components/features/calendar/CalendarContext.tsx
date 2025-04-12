
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Event } from './types/event';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { logger } from '@/utils/logger';

// Define our context types
export type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarContextType {
  // State
  viewMode: ViewMode;
  searchTerm: string;
  isLoading: boolean;
  pageError: string | null;
  createDialogOpen: boolean;
  showFileUploader: boolean;
  inviteDialogOpen: boolean;
  isAddingEvent: boolean;
  isInviting: boolean;
  
  // Event handlers
  setViewMode: (mode: ViewMode) => void;
  setSearchTerm: (term: string) => void;
  handleAddItem: () => void;
  handleDialogClose: (open: boolean) => void;
  handleFileUploaderChange: (open: boolean) => void;
  handleShareCalendar: () => void;
  handleInviteSent: (link: string) => void;
  setInviteDialogOpen: (open: boolean) => void;
  setAddingEvent: (adding: boolean) => void;
  setIsInviting: (inviting: boolean) => void;
  retryDataFetch: () => void;
  
  // Calendar events functionality
  eventsState: ReturnType<typeof useCalendarEvents>;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

interface CalendarProviderProps {
  children: ReactNode;
  initialView?: ViewMode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  initialView = 'day' 
}) => {
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Get toast functionality
  const { toast } = useToast();
  
  // Get calendar events functionality
  const eventsState = useCalendarEvents();

  // Load calendar data
  React.useEffect(() => {
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

  // Retry function for error handling
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

  // Event handlers without unnecessary try/catch blocks
  const handleAddItem = useCallback(() => {
    setCreateDialogOpen(true);
    setShowFileUploader(false);
    setIsAddingEvent(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setIsAddingEvent(false);
      // Improve focus management for accessibility
      setTimeout(() => {
        document.getElementById('add-event-button')?.focus();
      }, 0);
    }
  }, []);

  const handleFileUploaderChange = useCallback((open: boolean) => {
    setShowFileUploader(open);
  }, []);
  
  const handleViewModeChange = useCallback((value: ViewMode) => {
    if (viewMode !== value) {
      setViewMode(value);
      toast({
        title: "View Changed",
        description: `Calendar view set to ${value}`,
        role: "status",
        "aria-live": "polite"
      });
    }
  }, [viewMode, toast]);

  const handleShareCalendar = useCallback(() => {
    setInviteDialogOpen(true);
    setIsInviting(true);
  }, []);

  const handleInviteSent = useCallback((link: string) => {
    setInviteDialogOpen(false);
    setIsInviting(false);
    
    toast({
      title: "Invitation Link Generated",
      description: "The link has been created and is ready to share",
      role: "status",
      "aria-live": "polite"
    });
  }, [toast]);

  // Provide the context value
  const contextValue: CalendarContextType = {
    // State
    viewMode,
    searchTerm,
    isLoading,
    pageError,
    createDialogOpen,
    showFileUploader,
    inviteDialogOpen,
    isAddingEvent,
    isInviting,
    
    // Setters and handlers
    setViewMode: handleViewModeChange,
    setSearchTerm,
    handleAddItem,
    handleDialogClose,
    handleFileUploaderChange,
    handleShareCalendar,
    handleInviteSent,
    setInviteDialogOpen,
    setAddingEvent: setIsAddingEvent,
    setIsInviting,
    retryDataFetch,
    
    // Calendar events functionality
    eventsState
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for using the calendar context
export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};
