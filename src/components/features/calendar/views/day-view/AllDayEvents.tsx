
import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';

interface AllDayEventsProps {
  allDayEvents: Event[];
  handleViewEvent: (event: Event) => void;
}

const AllDayEvents: React.FC<AllDayEventsProps> = ({ allDayEvents, handleViewEvent }) => {
  const { isMobile } = useIsMobile();
  
  if (allDayEvents.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div className="grid grid-cols-[1fr] bg-muted/30 p-2 border-b">
        <div className={cn("text-sm font-medium", isMobile ? "text-[0.8rem]" : "")}>All day events</div>
      </div>
      
      <div className="p-2 space-y-2">
        {allDayEvents.map(event => (
          <div 
            key={event.id}
            className="rounded p-3 cursor-pointer hover:opacity-90 flex items-center touch-manipulation"
            style={{ backgroundColor: event.color || '#4285F4' }}
            onClick={() => handleViewEvent(event)}
          >
            <div className="flex-1">
              <div className="font-medium text-white">{event.title}</div>
              {event.location && (
                <div className="text-xs flex items-center text-white/90 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllDayEvents;
