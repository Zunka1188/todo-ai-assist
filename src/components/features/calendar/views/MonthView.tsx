import React from 'react';
import { Event } from '../types/event';

interface MonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minCellHeight?: number;
  disablePopups?: boolean; // Add this prop
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1,
  minCellHeight = 120,
  disablePopups = false // Add default value
}) => {
  // ... keep existing code
  return (
    <div>
      {/* Placeholder for MonthView implementation */}
      Month View Component
    </div>
  );
};

export default MonthView;
