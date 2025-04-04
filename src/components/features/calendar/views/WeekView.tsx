import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
  };
  reminder?: string;
}
interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  handleViewEvent: (event: Event) => void;
  theme: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
const WeekView: React.FC<WeekViewProps> = ({
  date,
  setDate,
  events,
  handleViewEvent,
  theme,
  weekStartsOn = 1 // Default to Monday
}) => {
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [showFullDay, setShowFullDay] = useState(true);
  const weekStart = startOfWeek(date, {
    weekStartsOn
  });
  const weekEnd = endOfWeek(date, {
    weekStartsOn
  });
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd
  });
  const prevWeek = () => {
    setDate(subWeeks(date, 1));
  };
  const nextWeek = () => {
    setDate(addWeeks(date, 1));
  };
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startDate, day) || isSameDay(event.endDate, day) || event.startDate <= day && event.endDate >= day);
  };

  // Function to get formatted time from date
  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create hours array for the time column based on current start/end hour settings
  const hours = Array.from({
    length: endHour - startHour + 1
  }, (_, i) => startHour + i);
  const handleFullDayToggle = () => {
    if (!showFullDay) {
      setStartHour(0);
      setEndHour(23);
      setShowFullDay(true);
    }
  };
  const handleStartHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 23) {
      setStartHour(value);
      setShowFullDay(value === 0 && endHour === 23);
    }
  };
  const handleEndHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 23) {
      setEndHour(value);
      setShowFullDay(startHour === 0 && value === 23);
    }
  };
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={cn("text-xl font-semibold", theme === 'light' ? "text-foreground" : "text-white")}>
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Range Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" className={cn("bg-[#9b87f5]", showFullDay ? "hover:bg-[#7E69AB]" : "bg-opacity-70 hover:bg-[#9b87f5] hover:bg-opacity-80")} onClick={handleFullDayToggle}>
          Full 24h
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm">From:</span>
          <Input type="number" min="0" max="23" value={startHour} onChange={handleStartHourChange} className="w-16 h-9 text-center" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">To:</span>
          <Input type="number" min="0" max="23" value={endHour} onChange={handleEndHourChange} className="w-16 h-9 text-center" />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* All-day events section */}
        <div className="grid grid-cols-8 divide-x border-b">
          
          {daysInWeek.map((day, index) => {
          const allDayEvents = getEventsForDay(day).filter(event => event.allDay);
          const isCurrentDate = isToday(day);
          return;
        })}
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-8 divide-x border-b">
          <div className="p-2 text-sm font-medium bg-muted/30">Time / Day</div>
          {daysInWeek.map((day, index) => {
          const isCurrentDate = isToday(day);
          return <div key={index} className={cn("p-2 text-center", isCurrentDate && "bg-accent/30")}>
                <div className="font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className={cn("text-sm", isCurrentDate ? "text-primary font-semibold" : "text-muted-foreground")}>
                  {format(day, 'd')}
                </div>
              </div>;
        })}
        </div>
        
        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          {hours.map(hour => {
          const hourDate = new Date();
          hourDate.setHours(hour, 0, 0, 0);
          return <div key={hour} className="grid grid-cols-8 divide-x border-b min-h-[60px]">
                <div className="p-2 text-xs text-right text-muted-foreground bg-muted/30">
                  {format(hourDate, 'h a')}
                </div>
                
                {daysInWeek.map((day, dayIndex) => {
              const dayHourStart = new Date(day);
              dayHourStart.setHours(hour, 0, 0, 0);
              const dayHourEnd = new Date(day);
              dayHourEnd.setHours(hour, 59, 59, 999);
              const hourEvents = events.filter(event => !event.allDay && (event.startDate >= dayHourStart && event.startDate <= dayHourEnd || event.endDate >= dayHourStart && event.endDate <= dayHourEnd || event.startDate <= dayHourStart && event.endDate >= dayHourEnd));
              const isCurrentDate = isToday(day);
              const now = new Date();
              const isCurrentHour = isToday(day) && now.getHours() === hour;
              return <div key={dayIndex} className={cn("p-1 relative", isCurrentDate && "bg-accent/20", isCurrentHour && "bg-accent/40")}>
                      {hourEvents.map(event => <div key={event.id} className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80" style={{
                  backgroundColor: event.color || '#4285F4'
                }} onClick={() => handleViewEvent(event)}>
                          <div className="flex items-center">
                            <Clock className="h-2.5 w-2.5 mr-1 text-white flex-shrink-0" />
                            <span className="text-white truncate">{event.title}</span>
                          </div>
                          <div className="text-white/90 text-[10px] truncate">
                            {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                          </div>
                        </div>)}
                    </div>;
            })}
              </div>;
        })}
        </div>
      </div>
    </div>;
};
export default WeekView;