
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getFormattedTime, isOutOfTimeRange } from '../utils/dateUtils';
import { Event } from '../types/event';

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
  const [startInputValue, setStartInputValue] = useState("0");
  const [endInputValue, setEndInputValue] = useState("23");
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  
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
    return events.filter(event => 
      isSameDay(event.startDate, day) || 
      isSameDay(event.endDate, day) || 
      (event.startDate <= day && event.endDate >= day)
    );
  };

  // Create hours array for the time column based on current start/end hour settings
  const hours = Array.from({
    length: endHour - startHour + 1
  }, (_, i) => startHour + i);
  
  // Check if any events will be hidden with current time range
  const hiddenEvents = events.filter(event => isOutOfTimeRange(event, startHour, endHour));

  const handleTimeRangeToggle = (preset: string) => {
    switch (preset) {
      case 'full':
        setStartHour(0);
        setEndHour(23);
        setStartInputValue("0");
        setEndInputValue("23");
        setShowFullDay(true);
        break;
      case 'business':
        setStartHour(8);
        setEndHour(18);
        setStartInputValue("8");
        setEndInputValue("18");
        setShowFullDay(false);
        break;
      case 'evening':
        setStartHour(17);
        setEndHour(23);
        setStartInputValue("17");
        setEndInputValue("23");
        setShowFullDay(false);
        break;
      case 'morning':
        setStartHour(4);
        setEndHour(12);
        setStartInputValue("4");
        setEndInputValue("12");
        setShowFullDay(false);
        break;
    }
  };

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartInputValue(value);
    } else {
      setEndInputValue(value);
    }
    
    if (value.trim() === '') {
      return;
    }
    
    const hour = parseInt(value, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return;
    }
    
    let newStart = startHour;
    let newEnd = endHour;
    
    if (type === 'start') {
      if (hour <= endHour) newStart = hour;
    } else {
      if (hour >= startHour) newEnd = hour;
    }
    
    const hidden = events.filter(event => isOutOfTimeRange(event, newStart, newEnd));
    
    if (hidden.length > 0) {
      toast({
        title: "Warning: Hidden Events",
        description: `${hidden.length} event${hidden.length === 1 ? '' : 's'} will be hidden with this time range.`,
        variant: "default",
      });
    }
    
    if (type === 'start') setStartHour(newStart);
    else setEndHour(newEnd);
    
    setShowFullDay(newStart === 0 && newEnd === 23);
  };

  const handleInputBlur = (type: 'start' | 'end') => {
    if (type === 'start') {
      const value = startInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setStartInputValue(startHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour > endHour) {
        setStartInputValue(startHour.toString());
      } else {
        setStartHour(hour);
        setStartInputValue(hour.toString());
      }
    } else {
      const value = endInputValue.trim();
      
      if (value === '' || isNaN(parseInt(value, 10))) {
        setEndInputValue(endHour.toString());
        return;
      }
      
      const hour = parseInt(value, 10);
      
      if (hour < 0 || hour > 23 || hour < startHour) {
        setEndInputValue(endHour.toString());
      } else {
        setEndHour(hour);
        setEndInputValue(hour.toString());
      }
    }
    
    setShowFullDay(startHour === 0 && endHour === 23);
  };
  
  return <div className="space-y-4">
      <div className={cn(
        "flex justify-between items-center",
        isMobile ? "flex-col space-y-2" : ""
      )}>
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? "text-foreground" : "text-white",
          isMobile ? "text-lg self-start" : ""
        )}>
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevWeek} 
            aria-label="Previous week"
            className="tap-target"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextWeek} 
            aria-label="Next week"
            className="tap-target"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Range Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Toggle
            pressed={showFullDay}
            onPressedChange={() => handleTimeRangeToggle('full')}
            className="bg-transparent data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white tap-target"
          >
            Full day
          </Toggle>
          <Toggle
            pressed={startHour === 8 && endHour === 18}
            onPressedChange={() => handleTimeRangeToggle('business')}
            className="bg-transparent data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white tap-target"
          >
            Business hours
          </Toggle>
          <Toggle
            pressed={startHour === 17 && endHour === 23}
            onPressedChange={() => handleTimeRangeToggle('evening')}
            className="bg-transparent data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white tap-target"
          >
            Evening
          </Toggle>
          <Toggle
            pressed={startHour === 4 && endHour === 12}
            onPressedChange={() => handleTimeRangeToggle('morning')}
            className="bg-transparent data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white tap-target"
          >
            Morning
          </Toggle>
        </div>
        
        <div className={cn(
          "flex items-center gap-3",
          isMobile ? "flex-wrap" : ""
        )}>
          <div className="flex items-center gap-1">
            <Label htmlFor="weekStartHour" className="text-sm whitespace-nowrap">From:</Label>
            <Input
              id="weekStartHour"
              type="text"
              inputMode="numeric"
              value={startInputValue}
              onChange={(e) => handleTimeRangeChange('start', e.target.value)}
              onBlur={() => handleInputBlur('start')}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Label htmlFor="weekEndHour" className="text-sm whitespace-nowrap">To:</Label>
            <Input
              id="weekEndHour"
              type="text"
              inputMode="numeric"
              value={endInputValue}
              onChange={(e) => handleTimeRangeChange('end', e.target.value)}
              onBlur={() => handleInputBlur('end')}
              className={cn("h-8 text-sm", isMobile ? "w-20" : "w-16")}
            />
          </div>
        </div>
        
        {hiddenEvents.length > 0 && (
          <Alert variant="destructive" className="py-2 bg-white border border-red-400 dark:bg-gray-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Warning: {hiddenEvents.length} event{hiddenEvents.length > 1 ? 's' : ''} {hiddenEvents.length > 1 ? 'are' : 'is'} outside the selected time range and {hiddenEvents.length > 1 ? 'are' : 'is'} not visible.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* All-day events section */}
        <div className="grid grid-cols-8 divide-x border-b">
          <div className="p-2 text-sm font-medium bg-muted/30">All Day</div>
          {daysInWeek.map((day, index) => {
            const allDayEvents = getEventsForDay(day).filter(event => event.allDay);
            const isCurrentDate = isToday(day);
            return (
              <div 
                key={index} 
                className={cn("p-1 min-h-[60px]", isCurrentDate && "bg-accent/30")}
              >
                {allDayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                    style={{backgroundColor: event.color || '#4285F4'}}
                    onClick={() => handleViewEvent(event)}
                  >
                    <span className="text-white truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-8 divide-x border-b">
          <div className="p-2 text-sm font-medium bg-muted/30">Time / Day</div>
          {daysInWeek.map((day, index) => {
            const isCurrentDate = isToday(day);
            return (
              <div 
                key={index} 
                className={cn("p-2 text-center", isCurrentDate && "bg-accent/30")}
              >
                <div className="font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className={cn("text-sm", isCurrentDate ? "text-primary font-semibold" : "text-muted-foreground")}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time grid */}
        <div className={cn(
          "overflow-y-auto",
          isMobile ? "max-h-[calc(100vh-320px)]" : "max-h-[600px]"
        )}>
          {hours.map(hour => {
            const hourDate = new Date();
            hourDate.setHours(hour, 0, 0, 0);
            return (
              <div key={hour} className="grid grid-cols-8 divide-x border-b min-h-[60px]">
                <div className="p-2 text-xs text-right text-muted-foreground bg-muted/30">
                  {format(hourDate, 'h a')}
                </div>
                
                {daysInWeek.map((day, dayIndex) => {
                  const dayHourStart = new Date(day);
                  dayHourStart.setHours(hour, 0, 0, 0);
                  const dayHourEnd = new Date(day);
                  dayHourEnd.setHours(hour, 59, 59, 999);
                  const hourEvents = events.filter(event => 
                    !event.allDay && (
                      (event.startDate >= dayHourStart && event.startDate <= dayHourEnd) || 
                      (event.endDate >= dayHourStart && event.endDate <= dayHourEnd) || 
                      (event.startDate <= dayHourStart && event.endDate >= dayHourEnd)
                    )
                  );
                  const isCurrentDate = isToday(day);
                  const now = new Date();
                  const isCurrentHour = isToday(day) && now.getHours() === hour;
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={cn("p-1 relative", 
                        isCurrentDate && "bg-accent/20", 
                        isCurrentHour && "bg-accent/40"
                      )}
                    >
                      {hourEvents.length > 0 && hourEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 touch-manipulation" 
                          style={{backgroundColor: event.color || '#4285F4'}} 
                          onClick={() => handleViewEvent(event)}
                        >
                          <div className="flex items-center">
                            <Clock className="h-2.5 w-2.5 mr-1 text-white flex-shrink-0" />
                            <span className="text-white truncate">{event.title}</span>
                          </div>
                          <div className="text-white/90 text-[10px] truncate">
                            {getFormattedTime(event.startDate)} - {getFormattedTime(event.endDate)}
                          </div>
                          {event.location && (
                            <div className="text-white/90 text-[10px] flex items-center truncate">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 text-white/80" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>;
};

export default WeekView;
