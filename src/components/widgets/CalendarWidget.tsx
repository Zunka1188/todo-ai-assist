
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Bell, Clock, MapPin, Edit, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { initialEvents } from '../features/calendar/data/initialEvents';
import { Event } from '../features/calendar/types/event';
import { getReminderLabel, getFormattedTime } from '../features/calendar/utils/dateUtils';
import { WidgetWrapper } from './shared/WidgetWrapper';

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const { theme } = useTheme();

  // Filter events for the current date
  const eventsForToday = initialEvents.filter((event) => {
    return date ? isSameDay(event.startDate, date) : false;
  });

  // Get events for the selected date
  const eventsForSelectedDate = initialEvents.filter((event) => {
    return isSameDay(event.startDate, selectedDate);
  });

  // Handle date selection in calendar
  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setSelectedDate(date);
    }
    setOpen(false); // Close the popover after selecting a date
  };

  // Handle event click to show details
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
    setShowImagePreview(false); // Reset image preview state
  };

  return (
    <WidgetWrapper className="h-full">
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-todo-purple" />
          <h3 className={cn("font-medium text-base sm:text-lg", theme === 'light' ? "text-foreground" : "text-white")}>Calendar</h3>
        </div>
        <Link to="/calendar" className="text-xs sm:text-sm text-todo-purple flex items-center min-h-[44px] min-w-[44px] touch-manipulation">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="pb-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal mb-4",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setOpen(true)}
              >
                <span>
                  {date ? format(date, 'PPP') : 'Select date'}
                </span>
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {/* Today's events list */}
        <div className="space-y-3 mt-2">
          {eventsForSelectedDate.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No events for this day
            </div>
          ) : (
            eventsForSelectedDate.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-1 p-3 rounded-md cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleEventClick(event)}
                style={{ 
                  borderLeft: `4px solid ${event.color || '#4285F4'}`,
                  backgroundColor: `${event.color || '#4285F4'}10`
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" /> 
                  <span>
                    {event.allDay 
                      ? 'All day' 
                      : `${getFormattedTime(event.startDate)} - ${getFormattedTime(event.endDate)}`}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> 
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                {event.reminder && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Bell className="h-3 w-3 mr-1" /> 
                    <span>{getReminderLabel(event.reminder)}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Event Detail Dialog */}
        <Dialog open={isEventDetailOpen} onOpenChange={setIsEventDetailOpen}>
          {selectedEvent && (
            <DialogContent className="sm:max-w-md">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.color || '#4285F4' }}
                  />
                  <h3 className="text-lg font-semibold flex-1 mx-2">{selectedEvent.title}</h3>
                  
                  <div className="flex space-x-1">
                    {selectedEvent.image && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowImagePreview(!showImagePreview)}
                        title="Toggle image preview"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    )}
                    <Link to="/calendar">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {selectedEvent.image && showImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-auto rounded-md object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {format(selectedEvent.startDate, 'PPP')}
                      {!selectedEvent.allDay && (
                        <>, {getFormattedTime(selectedEvent.startDate)} - {getFormattedTime(selectedEvent.endDate)}</>
                      )}
                      {selectedEvent.allDay && ' (All day)'}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  {selectedEvent.reminder && (
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{getReminderLabel(selectedEvent.reminder)}</span>
                    </div>
                  )}
                  
                  {selectedEvent.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-muted-foreground">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEventDetailOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Link to="/calendar" className="flex-1">
                    <Button className="bg-todo-purple hover:bg-todo-purple/90 w-full">
                      View in Calendar
                    </Button>
                  </Link>
                </DialogFooter>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </WidgetWrapper>
  );
};

export default CalendarWidget;
