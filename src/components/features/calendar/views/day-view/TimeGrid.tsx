import React, { useEffect, useRef } from 'react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';
import TimeGridEvent from './TimeGridEvent';
import { useDebugMode } from '@/hooks/useDebugMode';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeGridProps {
  events: Event[];
  date: Date;
  handleViewEvent: (event: Event) => void;
  startHour: number;
  numHours: number;
  gridRef: React.RefObject<HTMLDivElement>;
  processedEvents: Array<{
    maxOverlap: number;
    events: Event[];
  }>;
  maxTime?: string;
  hideEmptyRows?: boolean;
  constrainEvents?: boolean;
  disablePopups?: boolean;
}

const TimeGrid: React.FC<TimeGridProps> = ({ 
  events, 
  date, 
  handleViewEvent, 
  startHour, 
  numHours, 
  gridRef,
  processedEvents,
  maxTime = "23:00",
  hideEmptyRows = false,
  constrainEvents = false,
  disablePopups = true
}) => {
  const { isMobile } = useIsMobile();
  const { enabled: debugEnabled } = useDebugMode();
  const hourHeight = isMobile ? 60 : 80;
  
  // Parse max time to determine the maximum hour to display
  const maxHour = maxTime ? parseInt(maxTime.split(':')[0], 10) : 23;
  
  // Ref for scrolling to business hours
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Scroll to business hours (8 AM) on initial render
  useEffect(() => {
    if (gridRef.current) {
      const scrollToHour = 8; // 8 AM
      const scrollPosition = (scrollToHour - startHour) * hourHeight;
      setTimeout(() => {
        gridRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }, 300);
    }
  }, [startHour, hourHeight, gridRef]);

  // Enhanced debugging
  useEffect(() => {
    if (debugEnabled) {
      console.group('TimeGrid - Debug Info');
      console.log('Date:', date);
      console.log('Start Hour:', startHour);
      console.log('Num Hours:', numHours);
      console.log('Max Hour:', maxHour);
      console.log('Events Count:', events?.length);
      console.log('Processed Events Groups:', processedEvents?.length);
      console.log('Events:', events);
      console.log('Processed Events:', processedEvents);
      console.groupEnd();
    }
  }, [date, startHour, numHours, events, processedEvents, debugEnabled, maxHour]);

  // Generate hours for grid, constrained by maxHour if specified
  let hours = Array.from({ length: numHours }).map((_, index) => {
    const hour = startHour + index;
    return hour;
  });
  
  // Constrain to maxHour
  if (maxHour < startHour + numHours - 1) {
    hours = hours.filter(hour => hour <= maxHour);
  }
  
  // Filter out hours with no events if hideEmptyRows is true
  if (hideEmptyRows) {
    const hoursWithEvents = new Set<number>();
    
    processedEvents.forEach(group => {
      group.events.forEach(event => {
        const startHour = event.startDate.getHours();
        const endHour = event.endDate.getHours();
        
        for (let h = startHour; h <= endHour; h++) {
          if (h >= startHour && h <= maxHour) {
            hoursWithEvents.add(h);
          }
        }
      });
    });
    
    // Keep at least some hours if there are no events
    if (hoursWithEvents.size > 0) {
      hours = hours.filter(hour => hoursWithEvents.has(hour));
    }
  }

  return (
    <div
      ref={contentRef}
      className="relative border-t border-muted bg-background w-full"
      style={{
        minHeight: `${hours.length * hourHeight}px`,
        paddingBottom: "20px", // Add padding at the bottom for better scroll experience
        maxHeight: 'calc(100vh - 400px)', // Limit maximum height for scroll
      }}
      role="grid"
      aria-label="Time grid"
    >
      {/* Hour grid lines - improved visibility */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {hours.map((hour, index) => (
          <div
            key={`grid-${index}`}
            className={cn(
              "border-t border-muted absolute w-full",
              index % 2 === 0 ? "bg-muted/5" : ""
            )}
            style={{
              top: `${index * hourHeight}px`,
              height: `${hourHeight}px`,
            }}
          />
        ))}
      </div>
      
      {/* Vertical divider between time column and events column */}
      <div 
        className="absolute top-0 left-14 h-full border-l border-muted" 
        style={{ height: `${hours.length * hourHeight}px` }}
      />
      
      {/* Time markers column with vertical border - improved styling */}
      <div className="absolute top-0 left-0 h-full border-r border-muted bg-background/80 z-10">
        {hours.map((hour, index) => {
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          const amPm = hour < 12 || hour === 24 ? 'am' : 'pm';
          
          return (
            <div 
              key={`hour-${index}`} 
              className="absolute flex items-start justify-end pr-2 text-xs text-muted-foreground w-14"
              style={{
                top: `${index * hourHeight}px`,
                height: `${hourHeight}px`,
              }}
            >
              <div className="pt-1">{displayHour} {amPm}</div>
            </div>
          );
        })}
      </div>
      
      {/* Events container - proper layout with correct left margin */}
      <div className="absolute top-0 left-14 right-0 w-[calc(100%-3.5rem)] pl-2">
        {processedEvents && processedEvents.length > 0 ? (
          processedEvents.map((eventGroup, groupIndex) => {
            if (debugEnabled) {
              console.log(`Rendering event group ${groupIndex} with ${eventGroup.events.length} events`);
            }
            
            return eventGroup.events.map((event, eventIndex) => {
              if (debugEnabled) {
                console.log(`Event: ${event.title}`, 
                  `Start: ${event.startDate.toLocaleTimeString()}`, 
                  `End: ${event.endDate.toLocaleTimeString()}`);
              }
              
              return (
                <TimeGridEvent
                  key={`event-${event.id}`}
                  event={event}
                  totalOverlapping={eventGroup.maxOverlap}
                  index={eventIndex}
                  handleViewEvent={handleViewEvent}
                  startHour={startHour}
                  maxHour={maxHour}
                  constrainEvents={constrainEvents}
                  disablePopups={disablePopups}
                />
              );
            });
          })
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {events && events.length > 0 ? 
              "No events visible in current time range" : 
              "No events for this day"}
          </div>
        )}
      </div>
      
      {/* Empty hour cells for layout */}
      <div className="ml-14 pl-2">
        {hours.map((hour, index) => (
          <div 
            key={`hour-cell-${index}`} 
            className={cn(
              "border-b", 
              index % 2 === 0 ? "bg-muted/5" : "bg-transparent"
            )}
            style={{ height: `${hourHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeGrid;
