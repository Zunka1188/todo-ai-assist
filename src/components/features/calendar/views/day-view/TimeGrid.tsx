
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';
import TimeGridEvent from './TimeGridEvent';

interface TimeGridProps {
  hours: number[];
  date: Date;
  eventGroups: Event[][];
  startHour: number;
  handleViewEvent: (event: Event) => void;
}

const TimeGrid: React.FC<TimeGridProps> = ({
  hours,
  date,
  eventGroups,
  startHour,
  handleViewEvent
}) => {
  const { isMobile } = useIsMobile();
  const isCurrentDate = isToday(date);
  const now = new Date();
  
  // Calculate hour height based on device
  const hourHeight = isMobile ? 60 : 80;

  return (
    <div className={cn(
      "overflow-y-auto relative",
      isMobile ? "max-h-[calc(100vh-300px)]" : "max-h-[600px]"
    )}>
      {/* Event Overlay Layer */}
      <div className="absolute w-full h-full z-10 pointer-events-none">
        {eventGroups.map((group, groupIndex) => (
          <React.Fragment key={`group-${groupIndex}`}>
            {group.map((event, eventIndex) => (
              <TimeGridEvent
                key={`multi-${event.id}`}
                event={event}
                totalOverlapping={group.length}
                index={eventIndex}
                handleViewEvent={handleViewEvent}
                startHour={startHour}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Time Grid Background */}
      {hours.map(hour => {
        const hourDate = new Date(date);
        hourDate.setHours(hour, 0, 0, 0);
        
        const isCurrentHour = isCurrentDate && now.getHours() === hour;
        
        return (
          <div 
            key={hour} 
            className={cn(
              "grid grid-cols-[3.5rem_1fr] border-b",
              "min-h-[" + hourHeight + "px]",
              isCurrentHour && "bg-accent/20"
            )}
          >
            <div className="p-2 text-right text-muted-foreground border-r text-xs">
              {format(hourDate, 'h a')}
            </div>
            
            <div className={cn(
              "p-2 relative",
              "min-h-[" + hourHeight + "px]"
            )}>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeGrid;
