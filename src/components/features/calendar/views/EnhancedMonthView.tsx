
import React, { useEffect, useState } from 'react';
import MonthView from './MonthView';
import { Event } from '../types/event';
import { trackRenderPerformance } from '../utils/performanceTracking';
import ErrorBoundary from '../ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enhanced month view that adds performance tracking, loading states,
 * error handling and tooltips to the standard month view.
 */
interface EnhancedMonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
  isLoading?: boolean;
}

const EnhancedMonthView: React.FC<EnhancedMonthViewProps> = (props) => {
  const { isLoading = false } = props;
  const startTime = performance.now();
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);
  
  useEffect(() => {
    // Track performance after render
    trackRenderPerformance('MonthView', startTime, {
      eventsCount: props.events.length,
      logToConsole: true
    });
    
    // Mark initial render as complete after a small delay
    const timer = setTimeout(() => {
      setInitialRenderComplete(true);
    }, 100);
    
    // Clean up any resources if needed
    return () => {
      clearTimeout(timer);
    };
  }, [props.events.length]);
  
  if (isLoading) {
    return (
      <div className="w-full space-y-4" aria-busy="true" aria-label="Loading calendar view">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(7).fill(0).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(0).map((_, i) => (
            <Skeleton key={`cell-${i}`} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="relative w-full">
          {!initialRenderComplete && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div className="sm:block md:flex lg:flex xl:flex">
            <div className="w-full">
              <MonthView {...props} />
            </div>
            <div className="hidden md:block lg:block xl:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2 rounded-full hover:bg-muted"
                    aria-label="Calendar view information"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Month view shows all events in a calendar format.</p>
                  <p>Click on a date to view that day's events.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default React.memo(EnhancedMonthView);
