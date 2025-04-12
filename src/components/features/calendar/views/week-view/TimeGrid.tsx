
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isToday, isWeekend, isSameDay, addMinutes, set } from 'date-fns';
import { format } from 'date-fns';
import { Clock, MapPin, GripHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event } from '../../types/event';
import { getFormattedTime } from '../../utils/dateUtils';

interface TimeGridProps {
  daysInWeek: Date[];
  hours: number[];
  events: Event[][][]; // Array of event groups for each day
  handleViewEvent: (event: Event) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  currentTimePosition: number;
  getMultiHourEventStyle: (event: Event, day: Date, totalOverlapping: number, index: number) => React.CSSProperties;
  minCellHeight: number;
  scrollContainerHeight: string;
  onEventUpdate?: (updatedEvent: Event) => void;
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
  scrollContainerHeight,
  onEventUpdate
}) => {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragEventInitialTop, setDragEventInitialTop] = useState(0);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [ghostEventStyle, setGhostEventStyle] = useState<React.CSSProperties>({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Listen for edit mode changes via custom event
  useEffect(() => {
    const handleEditModeChange = (e: CustomEvent) => {
      setIsEditMode(e.detail.isEditMode);
    };

    window.addEventListener('calendar-edit-mode-change', handleEditModeChange as EventListener);
    
    // Check if we're already in edit mode (in case this component mounts after the mode is set)
    const existingMode = localStorage.getItem('calendar-edit-mode');
    if (existingMode === 'true') {
      setIsEditMode(true);
    }

    return () => {
      window.removeEventListener('calendar-edit-mode-change', handleEditModeChange as EventListener);
    };
  }, []);

  const handleDragStart = (event: Event, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode || !onEventUpdate) return;
    
    e.stopPropagation();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    setDraggedEvent(event);
    setDragStartY(clientY);
    setDragStartX(clientX);
    setDragEventInitialTop(rect.top);
    
    // Set initial ghost style
    setGhostEventStyle({
      position: 'absolute',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      backgroundColor: event.color || '#4285F4',
      opacity: 0.8,
      zIndex: 1000,
      pointerEvents: 'none'
    });

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!draggedEvent) return;
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate new position
    const deltaY = clientY - dragStartY;
    const newTop = dragEventInitialTop + deltaY;
    
    // Update ghost position
    setGhostEventStyle(prev => ({
      ...prev,
      top: `${newTop}px`
    }));
    
    // Determine which day column we're over
    const gridElement = document.querySelector('.grid-cols-8');
    if (gridElement) {
      const rect = gridElement.getBoundingClientRect();
      const dayColumnWidth = rect.width / 8; // First column is time, so 8 total columns
      
      // Calculate which day column we're over (0 is time column, 1-7 are day columns)
      let dayIndex = Math.floor((clientX - rect.left) / dayColumnWidth) - 1;
      
      // Ensure dayIndex is within bounds
      if (dayIndex >= 0 && dayIndex < daysInWeek.length) {
        setDragOverDay(dayIndex);
      } else {
        setDragOverDay(null);
      }
    }
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!draggedEvent || !onEventUpdate) {
      cleanup();
      return;
    }
    
    try {
      // Calculate new start time based on position
      const hourHeight = minCellHeight; // Height of each hour cell
      const minutesPerPixel = 60 / hourHeight;
      
      let clientY = 0;
      if ('changedTouches' in e) {
        // Touch event
        clientY = e.changedTouches[0].clientY;
      } else {
        // Mouse event
        clientY = e.clientY;
      }
      
      const deltaY = clientY - dragStartY;
      const minutesDelta = Math.round(deltaY * minutesPerPixel);
      
      const updatedEvent = { ...draggedEvent };
      
      // Calculate new dates
      const newStartDate = new Date(updatedEvent.startDate);
      newStartDate.setMinutes(newStartDate.getMinutes() + minutesDelta);
      
      const newEndDate = new Date(updatedEvent.endDate);
      newEndDate.setMinutes(newEndDate.getMinutes() + minutesDelta);
      
      // If day changed, update the day as well
      if (dragOverDay !== null) {
        const newDay = daysInWeek[dragOverDay];
        
        newStartDate.setFullYear(newDay.getFullYear(), newDay.getMonth(), newDay.getDate());
        newEndDate.setFullYear(newDay.getFullYear(), newDay.getMonth(), newDay.getDate());
      }
      
      updatedEvent.startDate = newStartDate;
      updatedEvent.endDate = newEndDate;
      
      // Update the event
      onEventUpdate(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
    }
    
    cleanup();
  };

  const cleanup = () => {
    setDraggedEvent(null);
    setDragOverDay(null);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  return (
    <>
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
              className="sticky left-0 z-10 border-r border-gray-800 bg-background" 
              style={{
                minWidth: "5rem"
              }}
            >
              {hours.map((hour, i) => (
                <div 
                  key={`hour-${i}`} 
                  className="border-b h-[60px] px-2 py-1 text-right text-xs text-muted-foreground" 
                  style={{
                    height: `${minCellHeight}px`
                  }}
                >
                  {format(new Date().setHours(hour), 'h a')}
                </div>
              ))}
            </div>
            
            {daysInWeek.map((day, dayIndex) => (
              <div 
                key={`day-${dayIndex}`} 
                className={cn(
                  "relative", 
                  isToday(day) ? "bg-accent/10" : "", 
                  isWeekend(day) ? "bg-muted/5" : "",
                  dragOverDay === dayIndex && "bg-primary/5"
                )}
              >
                {hours.map((_, hourIndex) => (
                  <div 
                    key={`${dayIndex}-${hourIndex}`} 
                    className="border-b relative" 
                    style={{
                      height: `${minCellHeight}px`
                    }}
                  >
                    
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
                
                {daysEventGroups[dayIndex] && daysEventGroups[dayIndex].map((group, groupIndex) => {
                  return group.map((event, eventIndex) => (
                    <div 
                      key={`event-${dayIndex}-${groupIndex}-${eventIndex}`} 
                      className={cn(
                        "absolute rounded-sm text-xs p-1 overflow-hidden cursor-pointer", 
                        "hover:opacity-90 transition-opacity touch-manipulation",
                        isEditMode && "hover:ring-2 ring-primary"
                      )}
                      style={getMultiHourEventStyle(event, day, group.length, eventIndex)} 
                      onClick={() => {
                        if (!isEditMode) {
                          handleViewEvent(event);
                        }
                      }}
                      data-event-id={event.id}
                      onMouseDown={isEditMode ? (e) => handleDragStart(event, e) : undefined}
                      onTouchStart={isEditMode ? (e) => handleDragStart(event, e) : undefined}
                    >
                      {isEditMode && (
                        <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center bg-black/20 cursor-move">
                          <GripHorizontal className="h-3 w-3 text-white/90" />
                        </div>
                      )}
                      <div className="font-medium text-white mb-0.5 truncate mt-1">{event.title}</div>
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
                  ));
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      {draggedEvent && (
        <div style={ghostEventStyle}>
          <div className="font-medium text-white mb-0.5 truncate">{draggedEvent.title}</div>
          <div className="flex items-center text-white/90 text-[10px] mb-0.5">
            <Clock className="h-2.5 w-2.5 mr-1 shrink-0" />
            <span className="truncate">
              {getFormattedTime(draggedEvent.startDate)} - {getFormattedTime(draggedEvent.endDate)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeGrid;
