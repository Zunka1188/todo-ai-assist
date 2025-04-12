
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isSameDay, isToday, isWeekend } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";

interface WeekHeaderProps {
  daysInWeek: Date[];
}

const WeekHeader: React.FC<WeekHeaderProps> = ({ daysInWeek }) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="grid grid-cols-8 divide-x border-gray-800">
      <div className={cn("p-2 text-sm font-medium bg-muted/30 text-center", isMobile ? "text-[0.8rem]" : "")} style={{
        minWidth: "5rem"
      }}>
        Time
      </div>
      {daysInWeek.map((day, index) => {
        const isCurrentDate = isToday(day);
        const isWeekendDay = isWeekend(day);
        return (
          <div key={index} className={cn("p-2 text-center", isCurrentDate && "bg-accent/30", isWeekendDay && "bg-muted/10")}>
            <div className={cn("font-medium", isMobile ? "text-[0.8rem]" : "")}>
              {format(day, 'EEE')}
            </div>
            <div className={cn("text-sm", isCurrentDate ? "text-primary font-semibold" : "text-muted-foreground", isWeekendDay && !isCurrentDate && "text-purple-300 dark:text-purple-300", isMobile ? "text-[0.8rem]" : "")}>
              {format(day, 'd')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekHeader;
