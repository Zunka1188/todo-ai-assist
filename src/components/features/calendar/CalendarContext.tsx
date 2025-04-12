import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { Event } from './types/event';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { logger } from '@/utils/logger';
import { useIsMobile } from '@/hooks/use-mobile';

// Define our context types
export type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface ViewDimensions {
  minCellHeight: number;
  headerHeight: number;
  timeWidth: number;
}

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
  currentDate: Date;
  dimensions: ViewDimensions;
  
  // Navigation
  todayButtonClick: () => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  getViewTitle: () => string;
  
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
  setCurrentDate: (date: Date) => void;
  
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Get toast functionality
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  // Get calendar events functionality
  const eventsState = useCalendarEvents();

  // Calculate view dimensions based on view mode
  const dimensions = useMemo(() => {
    switch(viewMode) {
      case 'day':
        return {
          minCellHeight: isMobile ? 48 : 64,
          headerHeight: 40,
          timeWidth: 60
        };
      case 'week':
        return {
          minCellHeight: isMobile ? 24 : 32, 
          headerHeight: 40,
          timeWidth: 60
        };
      case 'month':
        return {
          minCellHeight: isMobile ? 60 : 100,
          headerHeight: 32,
          timeWidth: 0
        };
      case 'agenda':
        return {
          minCellHeight: 64,
          headerHeight: 0,
          timeWidth: 120
        };
      default:
        return {
          minCellHeight: isMobile ? 60 : 100,
          headerHeight: 40,
          timeWidth: 60
        };
    }
  }, [viewMode, isMobile]);

  // Navigation functions
  const todayButtonClick = useCallback(() => {
    setCurrentDate(new Date());
    toast({
      title: "Today selected",
      description: "Calendar showing today's events",
      role: "status",
      "aria-live": "polite"
    });
  }, [toast]);
  
  const nextPeriod = useCallback(() => {
    let newDate = new Date(currentDate);
    
    switch(viewMode) {
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      case 'week':
        newDate = addDays(currentDate, 7);
        break;
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      default:
        newDate = addDays(currentDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);
  
  const prevPeriod = useCallback(() => {
    let newDate = new Date(currentDate);
    
    switch(viewMode) {
      case 'day':
        newDate = subDays(currentDate, 1);
        break;
      case 'week':
        newDate = subDays(currentDate, 7);
        break;
      case 'month':
        newDate = subMonths(currentDate, 1);
        break;
      default:
        newDate = subDays(currentDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);
  
  const getViewTitle = useCallback(() => {
    switch(viewMode) {
      case 'day':
        return format(currentDate, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d, yyyy');
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        if (isMobile) {
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
        }
        
        return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'agenda':
        return 'Upcoming Events';
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, viewMode, isMobile]);

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
  
  // Modified: Removed the toast notification when changing view mode
  const handleViewModeChange = useCallback((value: ViewMode) => {
    if (viewMode !== value) {
      setViewMode(value);
      // Toast notification removed as requested
    }
  }, [viewMode]);

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
    currentDate,
    dimensions,
    
    // Navigation
    todayButtonClick,
    nextPeriod,
    prevPeriod,
    getViewTitle,
    
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
    setCurrentDate,
    
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
