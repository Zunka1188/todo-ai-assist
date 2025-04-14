
import React, { useEffect } from 'react';
import MonthView from './MonthView';
import { Event } from '../types/event';
import { trackRenderPerformance } from '../utils/performanceTracking';

interface EnhancedMonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
}

const EnhancedMonthView: React.FC<EnhancedMonthViewProps> = (props) => {
  const startTime = performance.now();
  
  useEffect(() => {
    // Track performance after render
    trackRenderPerformance('MonthView', startTime, {
      eventsCount: props.events.length,
      logToConsole: true
    });
  });
  
  return <MonthView {...props} />;
};

export default EnhancedMonthView;
