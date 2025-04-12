
import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';

// Define all possible view modes
export type ViewMode = 'day' | 'week' | 'month' | 'agenda';

// Interface for calendar dimensions
interface ViewDimensions {
  minCellHeight: number;
  headerHeight: number;
  timeWidth: number;
}

// Context interface with retryDataFetch and other missing properties
interface CalendarContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  createDialogOpen: boolean;
  showFileUploader: boolean;
  handleDialogClose: (open: boolean) => void;
  handleFileUploaderChange: (open: boolean) => void;
  dimensions: ViewDimensions;
  retryDataFetch: () => void;
  // Add missing properties required by CalendarHeader
  isAddingEvent: boolean;
  isInviting: boolean;
  todayButtonClick: () => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  getViewTitle: () => string;
  handleAddItem: () => void;
  handleShareCalendar: () => void;
  // Add missing properties required by CalendarPage
  isLoading: boolean;
  pageError: string | null;
  inviteDialogOpen: boolean;
  handleInviteSent: (email: string) => void;
  setInviteDialogOpen: (open: boolean) => void;
}

// Create context with default values
const CalendarContext = createContext<CalendarContextValue>({
  viewMode: 'week',
  setViewMode: () => {},
  currentDate: new Date(),
  setCurrentDate: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  createDialogOpen: false,
  showFileUploader: false,
  handleDialogClose: () => {},
  handleFileUploaderChange: () => {},
  dimensions: {
    minCellHeight: 60,
    headerHeight: 40,
    timeWidth: 60
  },
  retryDataFetch: () => {},
  // Default values for missing properties
  isAddingEvent: false,
  isInviting: false,
  todayButtonClick: () => {},
  nextPeriod: () => {},
  prevPeriod: () => {},
  getViewTitle: () => "",
  handleAddItem: () => {},
  handleShareCalendar: () => {},
  isLoading: false,
  pageError: null,
  inviteDialogOpen: false,
  handleInviteSent: () => {},
  setInviteDialogOpen: () => {}
});

// Provider props interface
interface CalendarProviderProps {
  children: ReactNode;
  initialView?: ViewMode;
}

// Provider component
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  initialView = 'week' 
}) => {
  // State declarations
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [showFileUploader, setShowFileUploader] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);

  // Device-specific dimensions
  const dimensions: ViewDimensions = {
    minCellHeight: 60,
    headerHeight: 40,
    timeWidth: 60
  };

  // Handle dialog state
  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
  };

  // Handle file uploader state
  const handleFileUploaderChange = (open: boolean) => {
    setShowFileUploader(open);
  };
  
  // Add retry function
  const retryDataFetch = useCallback(() => {
    console.log("Retrying data fetch from CalendarContext");
    setIsLoading(true);
    
    // Simulate data fetching process
    setTimeout(() => {
      setIsLoading(false);
      setPageError(null);
    }, 1000);
  }, []);

  // Add calendar navigation handlers
  const todayButtonClick = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const nextPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() + 14);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const prevPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() - 14);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  // Get title based on current view and date
  const getViewTitle = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    
    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString('en-US', { month: 'short' })} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      case 'month':
        return currentDate.toLocaleDateString('en-US', options);
      case 'agenda':
        return `Upcoming Events`;
      default:
        return currentDate.toLocaleDateString('en-US', options);
    }
  }, [currentDate, viewMode]);

  // Event handlers
  const handleAddItem = useCallback(() => {
    setIsAddingEvent(true);
    setCreateDialogOpen(true);
    
    // Reset state after animation
    setTimeout(() => {
      setIsAddingEvent(false);
    }, 1000);
  }, []);

  const handleShareCalendar = useCallback(() => {
    setIsInviting(true);
    setInviteDialogOpen(true);
    
    // Reset state after animation
    setTimeout(() => {
      setIsInviting(false);
    }, 1000);
  }, []);

  const handleInviteSent = useCallback((email: string) => {
    console.log(`Invitation sent to ${email}`);
    setInviteDialogOpen(false);
  }, []);

  // Provide context value
  const value: CalendarContextValue = {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    searchTerm,
    setSearchTerm,
    createDialogOpen,
    showFileUploader,
    handleDialogClose,
    handleFileUploaderChange,
    dimensions,
    retryDataFetch,
    isAddingEvent,
    isInviting,
    todayButtonClick,
    nextPeriod,
    prevPeriod,
    getViewTitle,
    handleAddItem,
    handleShareCalendar,
    isLoading,
    pageError,
    inviteDialogOpen,
    handleInviteSent,
    setInviteDialogOpen
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for using the calendar context
export const useCalendar = () => useContext(CalendarContext);
