
import React, { createContext, useContext, useCallback } from 'react';
import { useCalendarState } from '@/state/useStore';
import { format, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ViewMode } from './types';

interface CalendarContextType {
  // State from store
  viewMode: ViewMode;
  currentDate: Date;
  searchTerm: string;
  createDialogOpen: boolean;
  showFileUploader: boolean;
  inviteDialogOpen: boolean;
  isAddingEvent: boolean;
  isInviting: boolean;
  events: any[];
  selectedEvent: any | null;
  
  // Dimensions and layout
  dimensions: {
    minCellHeight: number;
    headerHeight: number;
    timeWidth: number;
  };
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  setSearchTerm: (term: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setFileUploader: (show: boolean) => void;
  setInviteDialogOpen: (open: boolean) => void;
  setIsAddingEvent: (adding: boolean) => void;
  setIsInviting: (inviting: boolean) => void;
  setSelectedEvent: (event: any | null) => void;
  
  // Navigation
  nextPeriod: () => void;
  prevPeriod: () => void;
  todayButtonClick: () => void;
  getViewTitle: () => string;
  getDateRange: () => { start: Date; end: Date };
  
  // Event handlers
  handleAddItem: () => void;
  handleDialogClose: (open: boolean) => void;
  handleShareCalendar: () => void;
  
  // Event management
  addEvent: (event: any) => void;
  updateEvent: (event: any) => void;
  deleteEvent: (eventId: string) => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

interface CalendarProviderProps {
  children: React.ReactNode;
  initialView?: ViewMode;
}

export const UnifiedCalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  initialView = 'day' 
}) => {
  const { 
    viewMode, currentDate, searchTerm, createDialogOpen, 
    showFileUploader, inviteDialogOpen, isAddingEvent, 
    isInviting, events, selectedEvent, actions 
  } = useCalendarState();
  
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  // Set initial view if needed
  React.useEffect(() => {
    if (viewMode !== initialView) {
      actions.setViewMode(initialView);
    }
  }, [initialView, viewMode, actions]);
  
  // Calculate dimensions based on view mode and device
  const dimensions = React.useMemo(() => {
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
  
  // Navigation helpers
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
    
    actions.setCurrentDate(newDate);
  }, [currentDate, viewMode, actions]);
  
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
    
    actions.setCurrentDate(newDate);
  }, [currentDate, viewMode, actions]);
  
  const todayButtonClick = useCallback(() => {
    actions.setCurrentDate(new Date());
    toast({
      title: "Today selected",
      description: "Calendar showing today's events",
      role: "status",
      "aria-live": "polite"
    });
  }, [actions, toast]);
  
  const getViewTitle = useCallback(() => {
    switch(viewMode) {
      case 'day':
        return format(currentDate, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d, yyyy');
      case 'week': {
        const weekStart = addDays(currentDate, -3); // Approximate week start
        const weekEnd = addDays(currentDate, 3);    // Approximate week end
        
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
  
  const getDateRange = useCallback(() => {
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
  const handleAddItem = useCallback(() => {
    actions.setCreateDialogOpen(true);
    actions.setFileUploader(false);
    actions.setIsAddingEvent(true);
  }, [actions]);

  const handleDialogClose = useCallback((open: boolean) => {
    actions.setCreateDialogOpen(open);
    if (!open) {
      actions.setIsAddingEvent(false);
      // Improve focus management for accessibility
      setTimeout(() => {
        document.getElementById('add-event-button')?.focus();
      }, 0);
    }
  }, [actions]);

  const handleShareCalendar = useCallback(() => {
    actions.setInviteDialogOpen(true);
    actions.setIsInviting(true);
  }, [actions]);
  
  // Create the context value
  const contextValue = {
    // State
    viewMode,
    currentDate,
    searchTerm,
    createDialogOpen,
    showFileUploader,
    inviteDialogOpen,
    isAddingEvent,
    isInviting,
    events,
    selectedEvent,
    
    // Layout
    dimensions,
    
    // Actions
    setViewMode: actions.setViewMode,
    setCurrentDate: actions.setCurrentDate,
    setSearchTerm: actions.setSearchTerm,
    setCreateDialogOpen: actions.setCreateDialogOpen,
    setFileUploader: actions.setFileUploader,
    setInviteDialogOpen: actions.setInviteDialogOpen,
    setIsAddingEvent: actions.setIsAddingEvent,
    setIsInviting: actions.setIsInviting,
    setSelectedEvent: actions.setSelectedEvent,
    
    // Navigation
    nextPeriod,
    prevPeriod,
    todayButtonClick,
    getViewTitle,
    getDateRange,
    
    // Event handlers
    handleAddItem,
    handleDialogClose,
    handleShareCalendar,
    
    // Event management
    addEvent: actions.addEvent,
    updateEvent: actions.updateEvent,
    deleteEvent: actions.deleteEvent
  };
  
  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for using the calendar context
export const useUnifiedCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useUnifiedCalendar must be used within a UnifiedCalendarProvider');
  }
  
  return context;
};
