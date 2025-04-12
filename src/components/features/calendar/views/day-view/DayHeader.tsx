import React from 'react';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
interface DayHeaderProps {
  date: Date;
  theme: string;
  prevDay: () => void;
  nextDay: () => void;
}
const DayHeader: React.FC<DayHeaderProps> = ({
  date,
  theme,
  prevDay,
  nextDay
}) => {
  const {
    isMobile
  } = useIsMobile();
  const isCurrentDate = isToday(date);
  return;
};
export default DayHeader;