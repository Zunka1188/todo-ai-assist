
import { useState, useRef, useEffect } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, isToday, isWeekend, isSameDay } from 'date-fns'; // Added isSameDay import
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Event } from '../../types/event';

export const useWeekView = (props: {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
}) => {
  const { date, setDate, events, weekStartsOn = 1, minCellHeight = 60 } = props;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [showFullDay, setShowFullDay] = useState(true);
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Generated values
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const HOUR_HEIGHT = minCellHeight;
  const MINUTES_PER_HOUR = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / MINUTES_PER_HOUR;
  const TIME_COLUMN_WIDTH = 60;
  const DAY_COLUMN_WIDTH = (100 - TIME_COLUMN_WIDTH) / 7;
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const scrollContainerHeight = isMobile ? 'calc(100vh - 320px)' : 'calc(100vh - 300px)';

  // Navigate to previous week
  const prevWeek = () => setDate(subWeeks(date, 1));

  // Navigate to next week
  const nextWeek = () => setDate(addWeeks(date, 1));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour >= startHour && currentHour <= endHour) {
        const scrollPosition = (currentHour - startHour) * minCellHeight;
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollPosition - 100,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [startHour, endHour, minCellHeight]);

  const isEventVisible = (event: Event): boolean => {
    if (event.allDay) return true;
    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    const eventStartMinute = event.startDate.getMinutes();
    const eventEndMinute = event.endDate.getMinutes();
    const eventStart = eventStartHour + eventStartMinute / MINUTES_PER_HOUR;
    const eventEnd = eventEndHour + eventEndMinute / MINUTES_PER_HOUR;

    return eventStart <= endHour && eventEnd >= startHour;
  };

  const hiddenEvents = events.filter(event => !event.allDay && !isEventVisible(event));

  const groupOverlappingEvents = (events: Event[]): Event[][] => {
    if (events.length === 0) return [];
    const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const groups: Event[][] = [];
    let currentGroup: Event[] = [sortedEvents[0]];
    
    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const previousEvent = sortedEvents[i - 1];
      if (event.startDate < previousEvent.endDate) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  const getMultiHourEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (event.allDay) return false;
      const sameDay = isSameDay(event.startDate, day) || isSameDay(event.endDate, day) || 
                    (event.startDate <= day && event.endDate >= day);
      if (!sameDay) return false;
      if (!isEventVisible(event)) return false;
      return true;
    });
  };

  const getMultiHourEventStyle = (event: Event, day: Date, totalOverlapping = 1, index = 0): React.CSSProperties => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const effectiveStartDate = eventStart < dayStart ? dayStart : eventStart;
    const effectiveEndDate = eventEnd > dayEnd ? dayEnd : eventEnd;
    const startHourDecimal = effectiveStartDate.getHours() + effectiveStartDate.getMinutes() / MINUTES_PER_HOUR;
    const endHourDecimal = effectiveEndDate.getHours() + effectiveEndDate.getMinutes() / MINUTES_PER_HOUR;

    const visibleStartHourDecimal = Math.max(startHourDecimal, startHour);
    const visibleEndHourDecimal = Math.min(endHourDecimal, endHour + 1);

    const topPosition = (visibleStartHourDecimal - startHour) * HOUR_HEIGHT;
    const heightValue = Math.max((visibleEndHourDecimal - visibleStartHourDecimal) * HOUR_HEIGHT, 20);
    const dayColumnIndex = daysInWeek.findIndex(d => isSameDay(d, day));
    
    let eventWidth;
    let leftOffset;
    
    // Fixed positioning within the day column
    if (isMobile) {
      eventWidth = 80; // Percentage width within the column
      leftOffset = dayColumnIndex * (100 - TIME_COLUMN_WIDTH) / 7 + TIME_COLUMN_WIDTH;
    } else {
      const maxSideEvents = Math.min(totalOverlapping, 3);
      eventWidth = (100 - TIME_COLUMN_WIDTH) / 7 / maxSideEvents * 0.9; // 90% of column width divided by max overlapping events
      const adjustedIndex = index % maxSideEvents;
      const columnStart = dayColumnIndex * (100 - TIME_COLUMN_WIDTH) / 7 + TIME_COLUMN_WIDTH;
      leftOffset = columnStart + (adjustedIndex * eventWidth / maxSideEvents);
    }
    
    return {
      position: 'absolute' as const,
      top: `${topPosition}px`,
      height: `${heightValue}px`,
      left: `${leftOffset}%`,
      width: `${eventWidth}%`,
      minWidth: isMobile ? '80%' : '80px',
      zIndex: 20,
      backgroundColor: event.color || '#4285F4',
      opacity: 0.95
    };
  };

  const handleTimeRangeToggle = (preset: string) => {
    switch (preset) {
      case 'full':
        setStartHour(0);
        setEndHour(23);
        setStartInputValue("0");
        setEndInputValue("23");
        setShowFullDay(true);
        break;
      case 'business':
        setStartHour(8);
        setEndHour(18);
        setStartInputValue("8");
        setEndInputValue("18");
        setShowFullDay(false);
        break;
      case 'evening':
        setStartHour(17);
        setEndHour(23);
        setStartInputValue("17");
        setEndInputValue("23");
        setShowFullDay(false);
        break;
      case 'morning':
        setStartHour(4);
        setEndHour(12);
        setStartInputValue("4");
        setEndInputValue("12");
        setShowFullDay(false);
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
    const hidden = events.filter(event => {
      if (event.allDay) return false;
      const eventStartHour = event.startDate.getHours();
      const eventStartMinute = event.startDate.getMinutes();
      const eventEndHour = event.endDate.getHours();
      const eventEndMinute = event.endDate.getMinutes();
      const eventStart = eventStartHour + eventStartMinute / MINUTES_PER_HOUR;
      const eventEnd = eventEndHour + eventEndMinute / MINUTES_PER_HOUR;
      return eventEnd <= newStart || eventStart >= newEnd;
    });
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    setShowFullDay(newStart === 0 && newEnd === 23);
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
    setShowFullDay(startHour === 0 && endHour === 23);
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < startHour || currentHour > endHour) return -1;

    return (currentHour - startHour) * HOUR_HEIGHT + (currentMinute / 60) * HOUR_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();

  const getVisibleMultiHourEventGroups = (day: Date): Event[][] => {
    const dayEvents = getMultiHourEventsForDay(day);
    return groupOverlappingEvents(dayEvents);
  };

  const daysEventGroups = daysInWeek.map(day => {
    return getVisibleMultiHourEventGroups(day);
  });

  return {
    hours,
    daysInWeek,
    daysEventGroups,
    scrollRef,
    startHour,
    endHour,
    showFullDay,
    startInputValue,
    endInputValue,
    hiddenEvents,
    currentTimePosition,
    scrollContainerHeight,
    weekStart,
    weekEnd,
    prevWeek,
    nextWeek,
    getMultiHourEventStyle,
    handleTimeRangeToggle,
    handleTimeRangeChange,
    handleInputBlur
  };
};
