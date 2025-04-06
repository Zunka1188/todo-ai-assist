
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isToday, addDays, subDays } from 'date-fns';
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
  const { isMobile } = useIsMobile();
  const isCurrentDate = isToday(date);

  return (
    <div className={cn(
      "flex items-center justify-between"
    )}>
      <h2 className={cn(
        "font-semibold flex items-center",
        theme === 'light' ? "text-foreground" : "text-white",
        isMobile ? "text-base" : "text-xl"
      )}>
        {format(date, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d, yyyy')}
        {isCurrentDate && (
          <span className="ml-2 text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
            Today
          </span>
        )}
      </h2>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevDay}
          aria-label="Previous day"
          className="h-9 w-9 min-w-[36px]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextDay}
          aria-label="Next day"
          className="h-9 w-9 min-w-[36px]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DayHeader;
