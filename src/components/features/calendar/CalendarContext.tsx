
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define all possible view modes
export type ViewMode = 'day' | 'week' | 'month' | 'agenda';

// Interface for calendar dimensions
interface ViewDimensions {
  minCellHeight: number;
  headerHeight: number;
  timeWidth: number;
}

// Context interface with retryDataFetch
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
  retryDataFetch: () => void; // Add this function
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
  retryDataFetch: () => {} // Add default empty function
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
  const retryDataFetch = () => {
    console.log("Retrying data fetch from CalendarContext");
    // This is a placeholder - in a real app, this would trigger a refetch
  };

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
    retryDataFetch // Add this to the context value
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for using the calendar context
export const useCalendar = () => useContext(CalendarContext);
