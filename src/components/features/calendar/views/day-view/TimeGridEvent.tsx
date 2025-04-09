
import React from 'react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';
import { Clock, MapPin } from 'lucide-react';
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
  const { isMobile } = useIsMobile();
  const hourHeight = isMobile ? 60 : 80;
  const minuteHeight = hourHeight / 60;
  
  const calculateEventPosition = () => {
    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndMinute = event.endDate.getMinutes();
    
    const startMinutesSinceMidnight = eventStartHour * 60 + eventStartMinute;
    const endMinutesSinceMidnight = eventEndHour * 60 + eventEndMinute;
    const startHourInMinutes = startHour * 60;
    
    const topPosition = Math.max(0, (startMinutesSinceMidnight - startHourInMinutes) * minuteHeight);
    const height = Math.max(30, (endMinutesSinceMidnight - startMinutesSinceMidnight) * minuteHeight);
    
    // Improved width calculation based on overlapping events
    let width = 95;  // Default to 95% width if no overlap
    let leftPosition = 3; // Default to 3% from left edge
    
    if (totalOverlapping > 1) {
      // If events overlap, calculate appropriate width
      width = Math.max(95 / totalOverlapping, 45); // Ensure minimum readable width (45%)
      
      // For mobile, we want less side-by-side items
      if (isMobile && totalOverlapping > 2) {
        width = 90; // Full width on mobile for better readability
        leftPosition = 5;
      } else {
        // Position based on index, but ensure events don't go off-screen
        const gap = 1; // 1% gap between events
        leftPosition = (width + gap) * index;
        
        // Ensure event doesn't go off-screen
        if (leftPosition + width > 98) {
          leftPosition = 98 - width;
        }
      }
    }
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      left: `${leftPosition}%`,
      width: `${width}%`,
    };
  };
  
  const eventStyle = calculateEventPosition();
  
  return (
    <div 
      className="absolute rounded text-xs p-1.5 cursor-pointer overflow-hidden hover:opacity-90 transition-opacity touch-manipulation"
      style={{
        backgroundColor: event.color || '#4285F4',
        ...eventStyle,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        minHeight: '25px',
        touchAction: 'manipulation', // Improve touch behavior
        minWidth: isMobile ? '85%' : '90px', // Ensure minimum width for readability
      }}
      onClick={() => handleViewEvent(event)}
      role="button"
      aria-label={`Event: ${event.title}`}
      tabIndex={0}
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
  );
};

export default TimeGridEvent;
