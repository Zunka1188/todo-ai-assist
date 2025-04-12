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
const AllDayEvents: React.FC<AllDayEventsProps> = ({
  daysInWeek,
  events,
  handleViewEvent
}) => {
  const {
    isMobile
  } = useIsMobile();
  return;
};
export default AllDayEvents;