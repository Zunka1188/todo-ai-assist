
import React from 'react';
import { isSameDay, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Briefcase, User, Users, Bell, Calendar } from 'lucide-react';
import { Event } from '../types/event';
import { getFormattedTime } from '../utils/dateUtils';

interface CalendarEventItemProps {
  event: Event;
  viewType: 'day' | 'week' | 'month' | 'agenda';
  date?: Date;
  cellHeight?: number;
  timeColumnWidth?: number;
  position?: number;
  totalOverlapping?: number;
}

const CalendarEventItem: React.FC<CalendarEventItemProps> = ({
  event,
  viewType,
  date,
  cellHeight = 24,
  timeColumnWidth = 60,
  position = 0,
  totalOverlapping = 1
}) => {
  // Get event icon based on category or color
  const getEventIcon = () => {
    // This would be better with a proper category field
    // For now we'll infer from the color or some other property
    const color = event.color?.toLowerCase() || '';
    
    if (color.includes('blue') || event.title?.toLowerCase().includes('meeting')) {
      return <Users className="h-3 w-3 mr-1 flex-shrink-0" />;
    } else if (color.includes('green') || event.title?.toLowerCase().includes('work')) {
      return <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />;
    } else if (color.includes('purple') || event.title?.toLowerCase().includes('personal')) {
      return <User className="h-3 w-3 mr-1 flex-shrink-0" />;
    } else if (color.includes('amber') || color.includes('yellow') || event.title?.toLowerCase().includes('reminder')) {
      return <Bell className="h-3 w-3 mr-1 flex-shrink-0" />;
    }
    
    return <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />;
  };

  // Calculate positioning for day and week views
  const getEventStyle = () => {
    if (viewType === 'month' || viewType === 'agenda') {
      return {};
    }

    if (viewType === 'day' || viewType === 'week') {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      const startHour = eventStart.getHours() + (eventStart.getMinutes() / 60);
      const endHour = eventEnd.getHours() + (eventEnd.getMinutes() / 60);
      const duration = endHour - startHour;
      
      const width = totalOverlapping > 1 
        ? `calc((100% - ${timeColumnWidth}px) / ${totalOverlapping})`
        : `calc(100% - ${timeColumnWidth}px - 8px)`;
      
      const left = viewType === 'week' 
        ? `calc(${position / totalOverlapping * 100}% + ${timeColumnWidth}px)`
        : `${timeColumnWidth}px`;
      
      return {
        top: `${startHour * cellHeight}px`,
        height: `${Math.max(duration * cellHeight, 22)}px`,
        left: left,
        width: width,
        zIndex: 10 + position
      };
    }
    
    return {};
  };

  const eventStyle = getEventStyle();
  
  // For month view, we need to render a simple bar
  if (viewType === 'month') {
    return (
      <div
        className={cn(
          "flex items-center px-1 py-0.5 mb-1 rounded-sm text-xs truncate cursor-pointer",
          "hover:opacity-90 transition-opacity"
        )}
        style={{ backgroundColor: event.color || '#4285F4' }}
        onClick={() => window.dispatchEvent(new CustomEvent('view-event', { detail: event }))}
      >
        <span className="truncate text-white">
          {event.title}
        </span>
      </div>
    );
  }
  
  // For agenda view
  if (viewType === 'agenda') {
    return (
      <div 
        className="flex items-center p-2 border-l-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-sm mb-1"
        style={{ borderLeftColor: event.color || '#4285F4' }}
        onClick={() => window.dispatchEvent(new CustomEvent('view-event', { detail: event }))}
      >
        <div className="flex-1">
          <div className="flex items-center">
            {getEventIcon()}
            <span className="font-medium">{event.title}</span>
          </div>
          <div className="flex flex-wrap text-xs text-muted-foreground mt-1 gap-x-3">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
            </span>
            {event.location && (
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // For day/week views
  return (
    <div
      className={cn(
        "absolute rounded-sm text-xs p-1 overflow-hidden cursor-pointer",
        "hover:opacity-90 transition-opacity touch-manipulation"
      )}
      style={{
        backgroundColor: event.color || '#4285F4',
        ...eventStyle,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
      onClick={() => window.dispatchEvent(new CustomEvent('view-event', { detail: event }))}
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

export default CalendarEventItem;
