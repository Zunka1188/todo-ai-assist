
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Event } from '../../types/event';
import { getFormattedTime } from '../../utils/dateUtils';

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
  // Constants for calculations
  const HOUR_HEIGHT = 80;
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
    
    // Calculate width based on overlapping events
    const baseWidth = 88; // Base width percentage for the event column
    const widthPerEvent = baseWidth / totalOverlapping;
    
    // Calculate left position based on event index
    const leftOffset = (index * widthPerEvent) + 12;
    
    return {
      position: 'absolute',
      top: `${topPosition}px`,
      height: `${heightValue}px`,
      left: `${leftOffset}%`,
      width: `${widthPerEvent - 1}%`,
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
      <div className="font-medium text-white truncate">{event.title}</div>
      <div className="text-xs flex items-center text-white/90 mt-1">
        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
        <span className="truncate">{getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}</span>
      </div>
      {event.location && (
        <div className="text-xs flex items-center text-white/90 mt-1">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </div>
  );
};

export default TimeGridEvent;
