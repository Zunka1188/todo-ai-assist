
import { useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ViewMode } from '../CalendarContext';

interface UseCalendarNavigationProps {
  viewMode: ViewMode;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isMobile: boolean;
}

export const useCalendarNavigation = ({
  viewMode,
  currentDate,
  setCurrentDate,
  isMobile
}: UseCalendarNavigationProps) => {
  const { toast } = useToast();

  const todayButtonClick = useCallback(() => {
    setCurrentDate(new Date());
    toast({
      title: "Today selected",
      description: "Calendar showing today's events",
      role: "status",
      "aria-live": "polite"
    });
  }, [toast, setCurrentDate]);
  
  const nextPeriod = useCallback(() => {
    let newDate = new Date(currentDate);
    
    switch(viewMode) {
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      case 'week':
        newDate = addDays(currentDate, 7);
        break;
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      default:
        newDate = addDays(currentDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode, setCurrentDate]);
  
  const prevPeriod = useCallback(() => {
    let newDate = new Date(currentDate);
    
    switch(viewMode) {
      case 'day':
        newDate = subDays(currentDate, 1);
        break;
      case 'week':
        newDate = subDays(currentDate, 7);
        break;
      case 'month':
        newDate = subMonths(currentDate, 1);
        break;
      default:
        newDate = subDays(currentDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode, setCurrentDate]);
  
  const getViewTitle = useCallback(() => {
    switch(viewMode) {
      case 'day':
        return format(currentDate, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d, yyyy');
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        if (isMobile) {
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
        }
        
        return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'agenda':
        return 'Upcoming Events';
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, viewMode, isMobile]);

  return {
    todayButtonClick,
    nextPeriod,
    prevPeriod,
    getViewTitle
  };
};
