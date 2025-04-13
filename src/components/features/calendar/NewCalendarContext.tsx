import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ViewMode, CalendarContextType, CalendarDimensions } from './types';

const CalendarContext = React.createContext<CalendarContextType | null>(null);

interface CalendarProviderProps {
  children: React.ReactNode;
  initialView?: ViewMode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  initialView = 'day' 
}) => {
  // State declarations
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [showFileUploader, setShowFileUploader] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = React.useState(false);
  const [isInviting, setIsInviting] = React.useState(false);

  // Get toast functionality
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const eventsState = useCalendarEvents();

  // Calculate view dimensions based on view mode
  const dimensions = React.useMemo<CalendarDimensions>(() => {
    switch(viewMode) {
      case 'day':
        return {
          width: isMobile ? '100%' : '95%',
          height: isMobile ? '100%' : '95%',
          minWidth: '300px',
          minHeight: '400px',
          headerHeight: 60,
          timeWidth: 60
        };
      case 'month':
        return {
          width: '100%',
          height: '100%',
          minWidth: '300px',
          minHeight: '500px',
          headerHeight: 40,
          timeWidth: 0
        };
      case 'agenda':
        return {
          width: '100%',
          height: '100%',
          minWidth: '300px',
          minHeight: '400px',
          headerHeight: 40,
          timeWidth: 80
        };
      default:
        return {
          width: '100%',
          height: '100%',
          minWidth: '300px',
          minHeight: '400px',
          headerHeight: 40,
          timeWidth: 60
        };
    }
  }, [viewMode, isMobile]);

  // Navigation functions
  const todayButtonClick = React.useCallback(() => {
    setCurrentDate(new Date());
    toast({
      title: "Today selected",
      description: format(new Date(), 'MMMM d, yyyy'),
      variant: "default",
    });
  }, [toast]);

  const nextDate = React.useCallback(() => {
    const newDate = (() => {
      switch(viewMode) {
        case 'day':
          return addDays(currentDate, 1);
        case 'month':
          return addMonths(currentDate, 1);
        case 'agenda':
          return addDays(currentDate, 7);
        default:
          return currentDate;
      }
    })();
    setCurrentDate(newDate);
  }, [viewMode, currentDate]);

  const prevDate = React.useCallback(() => {
    const newDate = (() => {
      switch(viewMode) {
        case 'day':
          return subDays(currentDate, 1);
        case 'month':
          return subMonths(currentDate, 1);
        case 'agenda':
          return subDays(currentDate, 7);
        default:
          return currentDate;
      }
    })();
    setCurrentDate(newDate);
  }, [viewMode, currentDate]);

  const getDateRange = React.useCallback(() => {
    switch (viewMode) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'agenda':
        return { start: currentDate, end: addDays(currentDate, 7) };
      default:
        return { start: currentDate, end: currentDate };
    }
  }, [viewMode, currentDate]);

  // Event handlers
  const handleAddItem = React.useCallback(() => {
    setCreateDialogOpen(true);
    setShowFileUploader(false);
    setIsAddingEvent(true);
  }, []);

  const handleDialogClose = React.useCallback((open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setIsAddingEvent(false);
      setShowFileUploader(false);
    }
  }, []);

  const handleFileUploaderChange = React.useCallback((open: boolean) => {
    setShowFileUploader(open);
  }, []);
  
  const handleViewModeChange = React.useCallback((value: ViewMode) => {
    if (viewMode !== value) {
      setViewMode(value);
      toast({
        title: "View changed",
        description: `Switched to ${value} view`,
        variant: "default",
      });
    }
  }, [viewMode, toast]);

  const handleShareCalendar = React.useCallback(() => {
    setInviteDialogOpen(true);
    setIsInviting(true);
  }, []);

  const handleInviteSent = React.useCallback(() => {
    setInviteDialogOpen(false);
    setIsInviting(false);
    toast({
      title: "Calendar shared",
      description: "Calendar has been shared successfully",
      variant: "default",
    });
  }, [toast]);

  // Create context value
  const contextValue = React.useMemo<CalendarContextType>(() => ({
    searchTerm,
    viewMode,
    currentDate,
    createDialogOpen,
    showFileUploader,
    inviteDialogOpen,
    isLoading,
    pageError,
    isAddingEvent,
    isInviting,
    dimensions,
    setSearchTerm,
    setViewMode,
    setCurrentDate,
    nextDate,
    prevDate,
    todayButtonClick,
    handleAddItem,
    handleDialogClose,
    handleFileUploaderChange,
    handleViewModeChange,
    handleShareCalendar,
    handleInviteSent,
    getDateRange,
  }), [
    searchTerm,
    viewMode,
    currentDate,
    createDialogOpen,
    showFileUploader,
    inviteDialogOpen,
    isLoading,
    pageError,
    isAddingEvent,
    isInviting,
    dimensions,
    nextDate,
    prevDate,
    todayButtonClick,
    handleViewModeChange,
    handleShareCalendar,
    handleInviteSent,
    getDateRange
  ]);

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for using the calendar context
export const useCalendar = (): CalendarContextType => {
  const context = React.useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};
