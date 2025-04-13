export type ViewMode = 'day' | 'month' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

export interface CalendarDimensions {
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  headerHeight: number;
  timeWidth: number;
}

export interface CalendarContextType {
  searchTerm: string;
  viewMode: ViewMode;
  currentDate: Date;
  createDialogOpen: boolean;
  showFileUploader: boolean;
  inviteDialogOpen: boolean;
  isLoading: boolean;
  pageError: string | null;
  isAddingEvent: boolean;
  isInviting: boolean;
  dimensions: CalendarDimensions;
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  nextDate: () => void;
  prevDate: () => void;
  todayButtonClick: () => void;
  handleAddItem: () => void;
  handleDialogClose: (open: boolean) => void;
  handleFileUploaderChange: (open: boolean) => void;
  handleViewModeChange: (mode: ViewMode) => void;
  handleShareCalendar: () => void;
  handleInviteSent: () => void;
  getDateRange: () => { start: Date; end: Date };
}
