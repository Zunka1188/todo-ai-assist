
import React from 'react';
import { cn } from '@/lib/utils';
import { isSameDay, isToday, isWeekend } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";
import { Event } from '../../types/event';

interface AllDayEventsProps {
  daysInWeek: Date[];
  events: Event[];
  handleViewEvent: (event: Event) => void;
}

const AllDayEvents: React.FC<AllDayEventsProps> = ({ daysInWeek, events, handleViewEvent }) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="grid grid-cols-8 divide-x border-gray-800">
      <div className={cn("p-2 text-sm font-medium bg-muted/30 text-center", isMobile ? "text-[0.8rem]" : "")} style={{
        minWidth: "5rem"
      }}>
        All Day
      </div>
      {daysInWeek.map((day, index) => {
        const allDayEvents = events.filter(event => 
          (isSameDay(event.startDate, day) || isSameDay(event.endDate, day) || 
          (event.startDate <= day && event.endDate >= day)) && event.allDay
        );
        const isCurrentDate = isToday(day);
        const isWeekendDay = isWeekend(day);
        return (
          <div key={index} className={cn("p-1 min-h-[40px]", isCurrentDate && "bg-accent/30", isWeekendDay && "bg-muted/10")}>
            {allDayEvents.map(event => (
              <div 
                key={event.id} 
                className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                style={{
                  backgroundColor: event.color || '#4285F4'
                }} 
                onClick={e => {
                  e.stopPropagation();
                  handleViewEvent(event);
                }}
              >
                <span className="text-white truncate">{event.title}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default AllDayEvents;
