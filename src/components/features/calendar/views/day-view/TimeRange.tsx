
import React from 'react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Event } from '../../types/event';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeRangeProps {
  startHour: number;
  endHour: number;
  startInputValue: string;
  endInputValue: string;
  showAllHours: boolean;
  hiddenEvents: Event[];
  handleTimeRangeToggle: (preset: string) => void;
  handleTimeRangeChange: (type: 'start' | 'end', value: string) => void;
  handleInputBlur: (type: 'start' | 'end') => void;
}

const TimeRange: React.FC<TimeRangeProps> = ({
  startHour,
  endHour,
  startInputValue,
  endInputValue,
  showAllHours,
  hiddenEvents,
  handleTimeRangeToggle,
  handleTimeRangeChange,
  handleInputBlur
}) => {
  const { isMobile } = useIsMobile();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Toggle
          pressed={showAllHours}
          onPressedChange={() => handleTimeRangeToggle('full')}
          className="bg-transparent data-[state=on]:bg-todo-purple data-[state=on]:text-primary-foreground tap-target"
        >
          Full 24h
        </Toggle>
        <Toggle
          pressed={startHour === 8 && endHour === 18}
          onPressedChange={() => handleTimeRangeToggle('business')}
          className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
        >
          Business hours
        </Toggle>
        <Toggle
          pressed={startHour === 17 && endHour === 23}
          onPressedChange={() => handleTimeRangeToggle('evening')}
          className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
        >
          Evening
        </Toggle>
        <Toggle
          pressed={startHour === 4 && endHour === 12}
          onPressedChange={() => handleTimeRangeToggle('morning')}
          className="bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground tap-target"
        >
          Morning
        </Toggle>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="startHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>From:</Label>
            <Input
              id="startHour"
              type="text"
              inputMode="numeric"
              min="0"
              max="23"
              value={startInputValue}
              onChange={(e) => handleTimeRangeChange('start', e.target.value)}
              onBlur={() => handleInputBlur('start')}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Label htmlFor="endHour" className={cn("text-sm whitespace-nowrap", isMobile ? "text-[0.8rem]" : "")}>To:</Label>
            <Input
              id="endHour"
              type="text"
              inputMode="numeric"
              min="0"
              max="23"
              value={endInputValue}
              onChange={(e) => handleTimeRangeChange('end', e.target.value)}
              onBlur={() => handleInputBlur('end')}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
        </div>
      </div>
      
      {hiddenEvents.length > 0 && (
        <Alert 
          className="py-2 mt-3 bg-amber-100/90 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 text-amber-800 dark:text-amber-200 flex items-center"
        >
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <AlertDescription className={cn("text-sm", isMobile ? "text-[0.8rem]" : "")}>
            Warning: {hiddenEvents.length} event{hiddenEvents.length > 1 ? 's' : ''} {hiddenEvents.length > 1 ? 'are' : 'is'} outside the selected time range and {hiddenEvents.length > 1 ? 'are' : 'is'} not visible.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TimeRange;
