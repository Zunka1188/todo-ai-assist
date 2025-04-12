
import React, { useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useCalendar } from '../CalendarContext';
import { useDebounce } from '@/hooks/useDebounce';
import CalendarView from '../CalendarView';

const CalendarContent: React.FC = () => {
  const { theme } = useTheme();
  const { 
    viewMode,
    dimensions,
    currentDate, 
    searchTerm,
    createDialogOpen,
    showFileUploader,
    handleDialogClose,
    handleFileUploaderChange
  } = useCalendar();
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    />
  ), [
    viewMode,
    currentDate,
    debouncedSearchTerm,
    dimensions, 
    createDialogOpen, 
    showFileUploader, 
    handleDialogClose,
    handleFileUploaderChange
  ]);

  return (
    <div className={cn(
      "flex-1 overflow-hidden w-full",
      "bg-background dark:bg-transparent",
      theme === 'dark' ? 'text-white' : ''
    )}>
      <div className="h-full overflow-y-auto px-4 py-3">
        <ErrorBoundary>
          {memoizedCalendarView}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CalendarContent;
