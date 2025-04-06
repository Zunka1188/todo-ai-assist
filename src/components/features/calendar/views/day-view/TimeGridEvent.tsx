
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Event } from '../../types/event';
import { getFormattedTime } from '../../utils/dateUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeGridEventProps {
  event: Event;
  totalOverlapping: number;
  index: number;
  handleViewEvent: (event: Event) => void;
  startHour: number;
}

const TimeGridEvent: React.FC<TimeGridEventProps> = ({ 
  event, 
  totalOverlapping, 
  index, 
  handleViewEvent,
  startHour
}) => {
  const { isMobile } = useIsMobile();
  
  // Constants for calculations
  const HOUR_HEIGHT = isMobile ? 60 : 80;
  const MINUTES_PER_HOUR = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / MINUTES_PER_HOUR;

  // Calculate the style for the event with precise minute-level positioning
  const getMultiHourEventStyle = (): React.CSSProperties => {
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    
    // Calculate precise start and end positions with minute-level accuracy
    const eventStartHour = eventStartDate.getHours();
    const eventStartMinute = eventStartDate.getMinutes();
    const eventEndHour = eventEndDate.getHours();
    const eventEndMinute = eventEndDate.getMinutes();
    
    // Calculate exact decimal positions for start and end
    const startHourDecimal = eventStartHour + (eventStartMinute / MINUTES_PER_HOUR);
    const endHourDecimal = eventEndHour + (eventEndMinute / MINUTES_PER_HOUR);
    
    // Determine which parts of the event are visible in the current view
    const visibleStartHourDecimal = Math.max(startHourDecimal, startHour);
    const visibleEndHourDecimal = Math.min(endHourDecimal, startHour + 24);
    
    // Calculate top position and height with exact minute precision
    const topPosition = (visibleStartHourDecimal - startHour) * HOUR_HEIGHT;
    const heightValue = Math.max((visibleEndHourDecimal - visibleStartHourDecimal) * HOUR_HEIGHT, 20);
    
    // Calculate horizontal positioning for all events
    // Fixed width of 90% of column with 5% margin on each side
    const leftOffset = 5;
    
    // If there are overlapping events, adjust the width
    const widthValue = totalOverlapping > 1 ? 
      (90 / totalOverlapping) : 90;
    
    // For overlapping events, calculate position based on index
    const leftPosition = totalOverlapping > 1 ? 
      leftOffset + (index * (90 / totalOverlapping)) : 
      leftOffset;
    
    return {
      position: 'absolute',
      top: `${topPosition}px`,
      height: `${heightValue}px`,
      left: `${leftPosition}%`,
      width: `${widthValue}%`,
      zIndex: 20,
    };
  };

  return (
    <div 
      className="rounded p-2 cursor-pointer hover:opacity-90 touch-manipulation pointer-events-auto"
      style={{ 
        backgroundColor: event.color || '#4285F4',
        ...getMultiHourEventStyle()
      }}
      onClick={() => handleViewEvent(event)}
    >
      <div className={`font-medium text-white truncate ${isMobile ? "text-xs" : ""}`}>
        {event.title}
      </div>
      <div className={`flex items-center text-white/90 mt-1 ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
        <Clock className={`mr-1 flex-shrink-0 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
        <span className="truncate">{getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}</span>
      </div>
      {event.location && (
        <div className={`flex items-center text-white/90 mt-1 ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
          <MapPin className={`mr-1 flex-shrink-0 ${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </div>
  );
};

export default TimeGridEvent;
