
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { isToday, isWeekend } from 'date-fns';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event } from '../../types/event';
import { getFormattedTime } from '../../utils/dateUtils';

interface TimeGridProps {
  daysInWeek: Date[];
  hours: number[];
  events: Event[][];
  handleViewEvent: (event: Event) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  currentTimePosition: number;
  getMultiHourEventStyle: (event: Event, day: Date, totalOverlapping: number, index: number) => React.CSSProperties;
  minCellHeight: number;
  scrollContainerHeight: string;
}

const TimeGrid: React.FC<TimeGridProps> = ({
  daysInWeek,
  hours,
  events: daysEventGroups,
  handleViewEvent,
  scrollRef,
  currentTimePosition,
  getMultiHourEventStyle,
  minCellHeight,
  scrollContainerHeight
}) => {
  return (
    <ScrollArea 
      className="overflow-auto" 
      style={{
        height: scrollContainerHeight,
        position: 'relative'
      }} 
      ref={scrollRef}
    >
      <div className="relative">
        <div className="grid grid-cols-8 divide-x border-gray-800">
          <div 
            className="sticky left-0 z-10 border-r border-gray-800" 
            style={{
              minWidth: "5rem"
            }}
          >
            {hours.map((hour, i) => (
              <div 
                key={`hour-${i}`} 
                className="border-b h-[60px] px-2 py-1 text-right text-xs text-muted-foreground"
              >
                {format(new Date().setHours(hour), 'h a')}
              </div>
            ))}
          </div>
          
          {daysInWeek.map((day, dayIndex) => (
            <div 
              key={`day-${dayIndex}`} 
              className={cn("relative", isToday(day) ? "bg-accent/10" : "", isWeekend(day) ? "bg-muted/5" : "")}
            >
              {hours.map((_, hourIndex) => (
                <div 
                  key={`${dayIndex}-${hourIndex}`} 
                  className="border-b h-[60px] relative"
                >
                  <div className="absolute top-1/2 left-0 right-0 border-t border-gray-800 border-opacity-50"></div>
                </div>
              ))}
              
              {isToday(day) && currentTimePosition > 0 && (
                <div 
                  className="absolute left-0 right-0 flex items-center z-10 pointer-events-none" 
                  style={{
                    top: `${currentTimePosition}px`
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-red-500 ml-2"></div>
                  <div className="flex-1 h-[1px] bg-red-500"></div>
                </div>
              )}
              
              {daysEventGroups[dayIndex].map((group, groupIndex) => (
                <React.Fragment key={`group-${dayIndex}-${groupIndex}`}>
                  {group.map((event, eventIndex) => (
                    <div
                      key={`event-${dayIndex}-${groupIndex}-${eventIndex}`}
                      className={cn("absolute rounded-sm text-xs p-1 overflow-hidden cursor-pointer",
                        "hover:opacity-90 transition-opacity touch-manipulation"
                      )}
                      style={getMultiHourEventStyle(event, day, group.length, eventIndex)}
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="font-medium text-white mb-0.5 truncate">{event.title}</div>
                      <div className="flex items-center text-white/90 text-[10px] mb-0.5">
                        <Clock className="h-2.5 w-2.5 mr-1 shrink-0" />
                        <span className="truncate">
                          {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-white/90 text-[10px]">
                          <MapPin className="h-2.5 w-2.5 mr-1 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TimeGrid;
