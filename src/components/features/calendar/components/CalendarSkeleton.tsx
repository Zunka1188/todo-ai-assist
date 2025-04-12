import * as React from 'react';
import { cn } from '@/lib/utils';

interface CalendarSkeletonProps {
  className?: string;
}

const CalendarSkeleton: React.FC<CalendarSkeletonProps> = ({ className }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => i);

  return (
    <div className={cn("animate-pulse", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-24 bg-muted rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-8 divide-x border rounded-lg overflow-hidden">
        {/* Time column */}
        <div className="space-y-2 p-2">
          {hours.map((hour) => (
            <div key={hour} className="h-[60px]">
              <div className="h-4 w-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => (
          <div key={day} className="space-y-2 p-2">
            {hours.map((hour) => (
              <div key={`${day}-${hour}`} className="h-[60px] relative">
                {/* Random event placeholders */}
                {Math.random() > 0.8 && (
                  <div
                    className="absolute w-[90%] left-[5%] bg-muted rounded"
                    style={{
                      top: `${Math.random() * 40}px`,
                      height: `${Math.random() * 40 + 20}px`,
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
