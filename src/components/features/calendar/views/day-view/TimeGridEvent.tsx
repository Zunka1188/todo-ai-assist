
import React, { useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Event } from '../../types/event';
import { getFormattedTime } from '../../utils/dateUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebugMode } from '@/hooks/useDebugMode';

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
  const { enabled: debugEnabled } = useDebugMode();
  
  // Constants for calculations
  const HOUR_HEIGHT = isMobile ? 60 : 80;
  const MINUTES_PER_HOUR = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / MINUTES_PER_HOUR;

  // Debug logging of positioning calculations
  useEffect(() => {
    if (debugEnabled) {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
      console.group(`TimeGridEvent - ${event.title}`);
      console.log('Event:', event);
      console.log('Start Hour:', startHour);
      console.log('Total Overlapping:', totalOverlapping);
      console.log('Index:', index);
      console.log('Start Time:', eventStartDate.toLocaleTimeString());
      console.log('End Time:', eventEndDate.toLocaleTimeString());
      
      // Calculate values for debugging
      const startHourDecimal = eventStartDate.getHours() + (eventStartDate.getMinutes() / MINUTES_PER_HOUR);
      const endHourDecimal = eventEndDate.getHours() + (eventEndDate.getMinutes() / MINUTES_PER_HOUR);
      const visibleStartHourDecimal = Math.max(startHourDecimal, startHour);
      const visibleEndHourDecimal = Math.min(endHourDecimal, startHour + 24);
      const topPosition = (visibleStartHourDecimal - startHour) * HOUR_HEIGHT;
      const heightValue = Math.max((visibleEndHourDecimal - visibleStartHourDecimal) * HOUR_HEIGHT, 20);
      
      console.log('Calculated Start (decimal hours):', startHourDecimal);
      console.log('Calculated End (decimal hours):', endHourDecimal);
      console.log('Visible Start (decimal hours):', visibleStartHourDecimal);
      console.log('Visible End (decimal hours):', visibleEndHourDecimal);
      console.log('Top Position (px):', topPosition);
      console.log('Height (px):', heightValue);
      console.groupEnd();
    }
  }, [event, startHour, totalOverlapping, index, HOUR_HEIGHT, MINUTES_PER_HOUR, debugEnabled]);

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
    
    // Calculate horizontal positioning for overlapping events
    const leftOffset = 5;
    
    // If there are overlapping events, adjust the width and position
    const widthValue = totalOverlapping > 1 ? 
      (isMobile ? 88 / totalOverlapping : 90 / totalOverlapping) : 
      (isMobile ? 88 : 90);
    
    // For overlapping events, calculate position based on index
    const leftPosition = totalOverlapping > 1 ? 
      leftOffset + (index * (isMobile ? 88 / totalOverlapping : 90 / totalOverlapping)) : 
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
      role="button"
      aria-label={`Event: ${event.title} from ${getFormattedTime(event.startDate)} to ${getFormattedTime(event.endDate)}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleViewEvent(event);
        }
      }}
    >
      <div className={`font-medium text-white truncate ${isMobile ? "text-xs" : ""}`}>
        {event.title}
      </div>
      {!isMobile && (
        <>
          <div className="flex items-center text-white/90 mt-1 text-xs">
            <Clock className="mr-1 flex-shrink-0 h-3 w-3" />
            <span className="truncate">{getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center text-white/90 mt-1 text-xs">
              <MapPin className="mr-1 flex-shrink-0 h-3 w-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </>
      )}
      {isMobile && (
        <div className="flex items-center text-white/90 mt-0.5 text-[0.65rem]">
          <Clock className="mr-0.5 flex-shrink-0 h-2.5 w-2.5" />
          <span className="truncate">{getFormattedTime(event.startDate)}</span>
        </div>
      )}
    </div>
  );
};

export default TimeGridEvent;
