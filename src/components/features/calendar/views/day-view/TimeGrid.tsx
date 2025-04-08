
import React, { useEffect } from 'react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';
import TimeGridEvent from './TimeGridEvent';
import { useDebugMode } from '@/hooks/useDebugMode';
import { format } from 'date-fns';

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
}

const TimeGrid: React.FC<TimeGridProps> = ({ 
  events, 
  date, 
  handleViewEvent, 
  startHour, 
  numHours, 
  gridRef,
  processedEvents 
}) => {
  const { isMobile } = useIsMobile();
  const { enabled: debugEnabled } = useDebugMode();
  const hourHeight = isMobile ? 60 : 80;

  // Enhanced debugging
  useEffect(() => {
    if (debugEnabled) {
      console.group('TimeGrid - Debug Info');
      console.log('Date:', date);
      console.log('Start Hour:', startHour);
      console.log('Num Hours:', numHours);
      console.log('Events Count:', events?.length);
      console.log('Processed Events Groups:', processedEvents?.length);
      console.log('Events:', events);
      console.log('Processed Events:', processedEvents);
      console.groupEnd();
    }
  }, [date, startHour, numHours, events, processedEvents, debugEnabled]);

  // Generate hours for grid
  const hours = Array.from({ length: numHours }).map((_, index) => {
    const hour = startHour + index;
    return hour;
  });

  return (
    <div
      ref={gridRef}
      className="relative border-t border-muted bg-background h-full overflow-y-auto w-full"
      style={{
        minHeight: `${numHours * hourHeight}px`,
      }}
    >
      {/* Hour grid lines - improved visibility */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {hours.map((hour, index) => (
          <div
            key={`grid-${index}`}
            className="border-t border-muted absolute w-full"
            style={{
              top: `${index * hourHeight}px`,
              height: `${hourHeight}px`,
            }}
          />
        ))}
      </div>
      
      {/* Time markers - improved styling */}
      <div className="absolute top-0 left-0 h-full border-r border-muted bg-muted/5">
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
                borderRight: '1px solid var(--border)',
              }}
            >
              <div className="pt-1">{displayHour} {amPm}</div>
            </div>
          );
        })}
      </div>
      
      {/* Events container - wider layout */}
      <div className="absolute top-0 left-14 right-0 w-[calc(100%-3.5rem)]">
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
      <div className="ml-14">
        {hours.map((hour, index) => (
          <div 
            key={`hour-cell-${index}`} 
            className="min-h-[80px] border-b border-muted/30"
            style={{ height: `${hourHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeGrid;
