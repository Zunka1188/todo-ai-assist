
import React from 'react';
import { Loader2, CalendarIcon, RefreshCw } from 'lucide-react';
import { Event } from '@/components/features/calendar/types/event';
import EventsList from './EventsList';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarWidgetContentProps {
  isLoading: boolean;
  isRefreshing?: boolean;
  error: string | null;
  events: Event[];
  handleEventClick: (event: Event) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Displays calendar content with loading states, error handling,
 * and refresh functionality
 * 
 * @component
 * @example
 * ```tsx
 * <CalendarWidgetContent
 *   isLoading={isLoading}
 *   isRefreshing={isRefreshing}
 *   error={error}
 *   events={events}
 *   handleEventClick={handleEventClick}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
const CalendarWidgetContent: React.FC<CalendarWidgetContentProps> = ({
  isLoading,
  isRefreshing = false,
  error,
  events,
  handleEventClick,
  onRefresh,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div 
        className={`flex flex-col space-y-3 p-4 ${className}`}
        aria-busy="true"
        role="status"
      >
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`text-center text-muted-foreground p-4 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="mb-3">{error}</div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {events.length === 0 ? 'No events' : `${events.length} event${events.length === 1 ? '' : 's'}`}
        </span>
        
        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-7 w-7" 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh events"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Refresh events
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {events.length > 0 ? (
        <EventsList events={events} handleEventClick={handleEventClick} />
      ) : (
        <div className="text-center text-muted-foreground py-6">
          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
          No events scheduled for today
        </div>
      )}
    </div>
  );
};

export default CalendarWidgetContent;
