
import React from 'react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';
import TimeGridEvent from './TimeGridEvent';

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

  console.log("TimeGrid - Events:", events);
  console.log("TimeGrid - ProcessedEvents:", processedEvents);
  console.log("TimeGrid - StartHour/NumHours:", startHour, numHours);

  // Generate hour markers
  const hourMarkers = Array.from({ length: numHours + 1 }).map((_, index) => {
    const hour = startHour + index;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = hour < 12 || hour === 24 ? 'am' : 'pm';
    
    return (
      <div key={`hour-${index}`} className="relative">
        <div className="absolute -top-2.5 text-xs text-muted-foreground select-none">
          {displayHour} {amPm}
        </div>
      </div>
    );
  });

  return (
    <div
      ref={gridRef}
      className="relative border rounded-md bg-background h-full overflow-y-auto"
      style={{
        height: '100%',
        minHeight: `${(numHours) * (isMobile ? 60 : 80)}px`,
      }}
    >
      {/* Hour grid lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {Array.from({ length: numHours }).map((_, index) => (
          <div
            key={`grid-${index}`}
            className="border-t border-muted absolute w-full"
            style={{
              top: `${index * (isMobile ? 60 : 80)}px`,
              height: `${isMobile ? 60 : 80}px`,
            }}
          />
        ))}
      </div>
      
      {/* Time markers */}
      <div className="absolute top-0 left-2 h-full flex flex-col">
        {hourMarkers}
      </div>
      
      {/* Events */}
      {processedEvents && processedEvents.map((eventGroup, groupIndex) => {
        return eventGroup.events.map((event, eventIndex) => (
          <TimeGridEvent
            key={`event-${event.id}`}
            event={event}
            totalOverlapping={eventGroup.maxOverlap}
            index={eventIndex}
            handleViewEvent={handleViewEvent}
            startHour={startHour}
          />
        ));
      })}
    </div>
  );
};

export default TimeGrid;
