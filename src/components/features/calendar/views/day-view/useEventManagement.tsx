
import { useState, useRef, useEffect } from 'react';
import { Event } from '../../types/event';
import { useToast } from '@/hooks/use-toast';
import { useDebugMode } from '@/hooks/useDebugMode';

interface ProcessedEventGroup {
  maxOverlap: number;
  events: Event[];
}

export const useEventManagement = (
  events: Event[], 
  date: Date
) => {
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [showAllHours, setShowAllHours] = useState(true);
  const [hiddenEvents, setHiddenEvents] = useState<Event[]>([]);
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
  const { toast } = useToast();
  const { enabled: debugEnabled } = useDebugMode();

  const getEventsForDay = () => {
    if (!events) return [];
    
    const filteredEvents = events.filter(event => 
      isSameDay(event.startDate, date) || 
      isSameDay(event.endDate, date) ||
      (event.startDate <= date && event.endDate >= date)
    );
    
    if (debugEnabled) {
      console.log(`[useEventManagement] Found ${filteredEvents.length} events for ${date.toDateString()}`);
    }
    
    return filteredEvents;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const dayEvents = getEventsForDay();
  const allDayEvents = dayEvents.filter(event => event.allDay);
  const timeEvents = dayEvents.filter(event => !event.allDay);

  useEffect(() => {
    if (debugEnabled) {
      console.group('useEventManagement - Events Analysis');
      console.log('Date:', date);
      console.log('All Events:', events);
      console.log('Events for Day:', dayEvents);
      console.log('All-Day Events:', allDayEvents);
      console.log('Time Events:', timeEvents);
      console.log('Time Range:', `${startHour}:00 - ${endHour}:00`);
      console.groupEnd();
    }
  }, [events, date, dayEvents, allDayEvents, timeEvents, startHour, endHour, debugEnabled]);

  const hours = showAllHours 
    ? Array.from({ length: 24 }, (_, i) => i) 
    : Array.from({ length: (endHour - startHour) + 1 }, (_, i) => i + startHour);

  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    
    const eventStartHour = event.startDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndHour = event.endDate.getHours();
    const eventEndMinute = event.endDate.getMinutes();
    
    const eventStart = eventStartHour + (eventStartMinute / 60);
    const eventEnd = eventEndHour + (eventEndMinute / 60);
    
    const isVisible = eventStart < endHour + 1 && eventEnd > startHour;
    
    if (debugEnabled) {
      console.log(`Event ${event.title} visibility check:`, isVisible);
      console.log(`Event time: ${eventStart}-${eventEnd}, View time: ${startHour}-${endHour + 1}`);
    }
    
    return isVisible;
  };

  const getMultiHourEvents = (): Event[] => {
    return timeEvents.filter(event => {
      const startHour = event.startDate.getHours();
      const endHour = event.endDate.getHours();
      const startDay = new Date(event.startDate).setHours(0, 0, 0, 0);
      const endDay = new Date(event.endDate).setHours(0, 0, 0, 0);
      
      return (endDay > startDay) || (endHour > startHour) || 
             (endHour === startHour && event.endDate.getMinutes() > event.startDate.getMinutes());
    });
  };

  const getVisibleMultiHourEvents = (): Event[] => {
    const multiHourEvents = getMultiHourEvents();
    const visibleEvents = multiHourEvents.filter(event => isEventVisible(event));
    
    if (debugEnabled) {
      console.log(`Found ${multiHourEvents.length} multi-hour events, ${visibleEvents.length} visible`);
    }
    
    return visibleEvents;
  };

  const groupOverlappingEvents = (events: Event[]): ProcessedEventGroup[] => {
    if (!events || events.length === 0) return [];
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    const groups: ProcessedEventGroup[] = [];
    let currentGroup: Event[] = [sortedEvents[0]];
    
    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const previousEvent = sortedEvents[i - 1];
      
      if (event.startDate < previousEvent.endDate) {
        currentGroup.push(event);
      } else {
        groups.push({
          maxOverlap: currentGroup.length,
          events: [...currentGroup]
        });
        currentGroup = [event];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push({
        maxOverlap: currentGroup.length,
        events: [...currentGroup]
      });
    }
    
    if (debugEnabled) {
      console.log(`Grouped ${events.length} events into ${groups.length} overlap groups`);
      groups.forEach((group, i) => {
        console.log(`Group ${i}: ${group.maxOverlap} overlapping events`);
        group.events.forEach(e => console.log(`- ${e.title}: ${e.startDate.toLocaleTimeString()} - ${e.endDate.toLocaleTimeString()}`));
      });
    }
    
    return groups;
  };

  const checkForHiddenEvents = (start: number, end: number) => {
    const hidden = timeEvents.filter(event => {
      const eventStartHour = event.startDate.getHours();
      const eventStartMinute = event.startDate.getMinutes();
      const eventEndHour = event.endDate.getHours();
      const eventEndMinute = event.endDate.getMinutes();
      
      const eventStart = eventStartHour + (eventStartMinute / 60);
      const eventEnd = eventEndHour + (eventEndMinute / 60);
      
      return eventEnd <= start || eventStart >= end + 1;
    });

    setHiddenEvents(hidden);
    
    if (hidden.length > 0) {
      toast({
        title: "Warning: Hidden Events",
        description: `${hidden.length} event${hidden.length === 1 ? '' : 's'} will be hidden with this time range.`,
        variant: "default",
      });
    }
    
    return hidden;
  };

  const handleTimeRangeToggle = (preset: string) => {
    if (debugEnabled) {
      console.log(`Toggling time range preset: ${preset}`);
    }
    
    switch (preset) {
      case 'full':
        setStartHour(0);
        setEndHour(23);
        setStartInputValue("0");
        setEndInputValue("23");
        setShowAllHours(true);
        setHiddenEvents([]);
        break;
      case 'business':
        setStartHour(8);
        setEndHour(18);
        setStartInputValue("8");
        setEndInputValue("18");
        setShowAllHours(false);
        checkForHiddenEvents(8, 18);
        break;
      case 'evening':
        setStartHour(17);
        setEndHour(23);
        setStartInputValue("17");
        setEndInputValue("23");
        setShowAllHours(false);
        checkForHiddenEvents(17, 23);
        break;
      case 'morning':
        setStartHour(4);
        setEndHour(12);
        setStartInputValue("4");
        setEndInputValue("12");
        setShowAllHours(false);
        checkForHiddenEvents(4, 12);
        break;
    }
  };

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartInputValue(value);
    } else {
      setEndInputValue(value);
    }
    
    if (value.trim() === '') {
      return;
    }
    
    const hour = parseInt(value, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return;
    }
    
    let newStart = startHour;
    let newEnd = endHour;
    
    if (type === 'start') {
      if (hour <= endHour) newStart = hour;
    } else {
      if (hour >= startHour) newEnd = hour;
    }
    
    checkForHiddenEvents(newStart, newEnd);
    
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    
    setShowAllHours(newStart === 0 && newEnd === 23);
    
    if (debugEnabled) {
      console.log(`Time range changed: ${type === 'start' ? newStart : startHour}:00 - ${type === 'end' ? newEnd : endHour}:00`);
    }
  };

  const handleInputBlur = (type: 'start' | 'end') => {
    if (type === 'start') {
      const value = startInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setStartInputValue(startHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour > endHour) {
        setStartInputValue(startHour.toString());
      } else {
        setStartHour(hour);
        setStartInputValue(hour.toString());
      }
    } else {
      const value = endInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setEndInputValue(endHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour < startHour) {
        setEndInputValue(endHour.toString());
      } else {
        setEndHour(hour);
        setEndInputValue(hour.toString());
      }
    }
    
    setShowAllHours(startHour === 0 && endHour === 23);
  };
  
  // Process and group events
  const processedEvents = groupOverlappingEvents(getVisibleMultiHourEvents());

  return {
    startHour,
    endHour,
    startInputValue,
    endInputValue,
    showAllHours,
    hiddenEvents,
    hours,
    allDayEvents,
    timeEvents,
    processedEvents,
    handleTimeRangeToggle,
    handleTimeRangeChange,
    handleInputBlur,
    checkForHiddenEvents,
  };
};
