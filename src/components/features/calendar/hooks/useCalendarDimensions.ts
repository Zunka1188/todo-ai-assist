
import { useMemo } from 'react';
import { ViewMode } from '../CalendarContext';

interface UseCalendarDimensionsProps {
  viewMode: ViewMode;
  isMobile: boolean;
}

export const useCalendarDimensions = ({ viewMode, isMobile }: UseCalendarDimensionsProps) => {
  return useMemo(() => {
    switch(viewMode) {
      case 'day':
        return {
          minCellHeight: isMobile ? 48 : 64,
          headerHeight: 40,
          timeWidth: 60
        };
      case 'week':
        return {
          minCellHeight: isMobile ? 24 : 32, 
          headerHeight: 40,
          timeWidth: 60
        };
      case 'month':
        return {
          minCellHeight: isMobile ? 60 : 100,
          headerHeight: 32,
          timeWidth: 0
        };
      case 'agenda':
        return {
          minCellHeight: 64,
          headerHeight: 0,
          timeWidth: 120
        };
      default:
        return {
          minCellHeight: isMobile ? 60 : 100,
          headerHeight: 40,
          timeWidth: 60
        };
    }
  }, [viewMode, isMobile]);
};
