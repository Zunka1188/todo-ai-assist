import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventSchedulerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  eventNotes: string;
  setEventNotes: (notes: string) => void;
}

export const EventScheduler: React.FC<EventSchedulerProps> = ({
  selectedDate,
  setSelectedDate,
  eventNotes,
  setEventNotes,
}) => {
  return (
    <div className="flex items-start">
      <div className="bg-secondary px-3 py-2 rounded-lg w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Textarea
          placeholder="Add notes about this cooking event..."
          className="mt-2"
          value={eventNotes}
          onChange={(e) => setEventNotes(e.target.value)}
        />
      </div>
    </div>
  );
};
