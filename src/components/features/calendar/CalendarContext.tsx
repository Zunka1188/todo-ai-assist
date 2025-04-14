
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { useCalendarDimensions } from './hooks/useCalendarDimensions';
import { useCalendarDialogs } from './hooks/useCalendarDialogs';

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
  // Use extracted hooks for better organization and performance
  const { isMobile } = useIsMobile();
  
  const {
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    createDialogOpen,
    setCreateDialogOpen,
    showFileUploader,
    setShowFileUploader,
    inviteDialogOpen,
    setInviteDialogOpen,
    isLoading,
    pageError,
    isAddingEvent,
    setIsAddingEvent,
    isInviting,
    setIsInviting,
    retryDataFetch
  } = useCalendarState({ initialView });
  
  // Get calendar navigation functions
  const navigation = useCalendarNavigation({ 
    viewMode, 
    currentDate, 
    setCurrentDate,
    isMobile 
  });
  
  // Calculate view dimensions based on view mode
  const dimensions = useCalendarDimensions({ viewMode, isMobile });
  
  // Get dialog management functions
  const dialogs = useCalendarDialogs({
    setCreateDialogOpen,
    setShowFileUploader,
    setIsAddingEvent,
    setInviteDialogOpen,
    setIsInviting
  });
  
  // Get calendar events functionality
  const eventsState = useCalendarEvents();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<CalendarContextType>(() => ({
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
    ...navigation,
    
    // Setters and handlers
    setViewMode,
    setSearchTerm,
    ...dialogs,
    setInviteDialogOpen,
    setAddingEvent: setIsAddingEvent,
    setIsInviting,
    retryDataFetch,
    setCurrentDate,
    
    // Calendar events functionality
    eventsState
  }), [
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
    navigation,
    setViewMode,
    setSearchTerm,
    dialogs,
    setInviteDialogOpen,
    setIsAddingEvent,
    setIsInviting,
    retryDataFetch,
    setCurrentDate,
    eventsState
  ]);

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
