
import React, { useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useCalendar } from '../CalendarContext';
import { useDebounce } from '@/hooks/useDebounce';
import CalendarView from '../CalendarView';

interface CalendarContentProps {
  disablePopups?: boolean;
  maxTime?: string;
  minTime?: string;
  hideEmptyRows?: boolean;
  deduplicateAllDay?: boolean;
  constrainEvents?: boolean;
  scrollable?: boolean;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  scrollBehavior?: ScrollBehavior;
  scrollDuration?: number;
}

const CalendarContent: React.FC<CalendarContentProps> = ({ 
  disablePopups = true, // Default to disabled popups
  maxTime = "23:59",
  minTime = "00:00",
  hideEmptyRows = true,
  deduplicateAllDay = true,
  constrainEvents = true,
  scrollable = true,
  onScroll = () => {},
  scrollBehavior = 'smooth',
  scrollDuration = 300
}) => {
  const { theme } = useTheme();
  const { 
    viewMode,
    dimensions,
    currentDate, 
    searchTerm,
    createDialogOpen,
    showFileUploader,
    handleDialogClose,
    handleFileUploaderChange,
    retryDataFetch
  } = useCalendar();
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onScroll(event);
  };

  // Memoize the calendar view to prevent unnecessary rerenders
  const memoizedCalendarView = useMemo(() => (
    <CalendarView 
      viewMode={viewMode}
      date={currentDate}
      searchTerm={debouncedSearchTerm} 
      weekStartsOn={1} 
      isCreateDialogOpen={createDialogOpen} 
      setIsCreateDialogOpen={handleDialogClose}
      isFileUploaderOpen={showFileUploader}
      setIsFileUploaderOpen={handleFileUploaderChange}
      dimensions={dimensions}
      disablePopups={disablePopups}
      maxTime={maxTime}
      minTime={minTime}
      hideEmptyRows={hideEmptyRows}
      deduplicateAllDay={deduplicateAllDay}
      constrainEvents={constrainEvents}
      scrollable={scrollable}
      scrollBehavior={scrollBehavior}
      scrollDuration={scrollDuration}
    />
  ), [
    viewMode,
    currentDate,
    debouncedSearchTerm,
    dimensions, 
    createDialogOpen, 
    showFileUploader, 
    handleDialogClose,
    handleFileUploaderChange,
    disablePopups,
    maxTime,
    minTime,
    hideEmptyRows,
    deduplicateAllDay,
    constrainEvents,
    scrollable,
    scrollBehavior,
    scrollDuration
  ]);

  return (
    <div 
      className={cn(
        "flex-1 overflow-hidden w-full",
        "bg-background dark:bg-transparent",
        theme === 'dark' ? 'text-white' : ''
      )}
    >
      <div 
        className={cn(
          "h-full px-4 py-3",
          scrollable ? "overflow-y-auto" : "overflow-hidden"
        )} 
        style={{ padding: '0 16px' }}
        onScroll={handleScroll}
      >
        <ErrorBoundary>
          {memoizedCalendarView}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CalendarContent;
