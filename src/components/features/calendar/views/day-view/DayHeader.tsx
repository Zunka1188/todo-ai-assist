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
  return <div className="flex items-center justify-between py-2 px-2 border-b">
      <div className="flex items-center space-x-1">
        
        <div className="flex flex-col">
          <span className={cn("text-lg font-medium leading-none", isCurrentDate ? "text-blue-500" : "")}>
            {format(date, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d')}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'yyyy')}
          </span>
        </div>
        
      </div>
    </div>;
};
export default DayHeader;