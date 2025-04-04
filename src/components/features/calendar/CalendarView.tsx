import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Plus, CheckSquare, Bell, ChevronLeft, ChevronRight, Trash, Edit, Clock, MapPin, FileText, CalendarDays, List, Image } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import DayView from './views/DayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import AgendaView from './views/AgendaView';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  image?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
  };
  reminder?: string;
}

const reminderOptions = [
  { value: "none", label: "No reminder" },
  { value: "0", label: "At time of event" },
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
  { value: "2880", label: "2 days before" },
];

const colorOptions = [
  { value: "#4285F4", label: "Blue" },
  { value: "#EA4335", label: "Red" },
  { value: "#FBBC05", label: "Yellow" },
  { value: "#34A853", label: "Green" },
  { value: "#8E24AA", label: "Purple" },
  { value: "#F4511E", label: "Orange" },
  { value: "#039BE5", label: "Light Blue" },
  { value: "#0B8043", label: "Dark Green" },
  { value: "#D50000", label: "Dark Red" },
  { value: "#FF6D00", label: "Dark Orange" },
];

const recurringOptions = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date(),
  startTime: z.string().optional(),
  endDate: z.date(),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().default("#4285F4"),
  image: z.string().optional(),
  recurringType: z.string().default("none"),
  recurringEndDate: z.date().optional(),
  recurringOccurrences: z.string().optional(),
  recurringDaysOfWeek: z.array(z.string()).optional(),
  reminder: z.string().default("30"),
});

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync to discuss project progress',
    startDate: new Date(2025, 3, 5, 10, 0), // April 5, 2025, 10:00 AM
    endDate: new Date(2025, 3, 5, 11, 30), // April 5, 2025, 11:30 AM
    location: 'Conference Room A',
    color: '#4285F4',
    reminder: '30',
    recurring: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Monday
    }
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    description: 'Regular check-up with Dr. Smith',
    startDate: new Date(2025, 3, 8, 14, 30), // April 8, 2025, 2:30 PM
    endDate: new Date(2025, 3, 8, 15, 30), // April 8, 2025, 3:30 PM
    location: 'Dental Clinic',
    color: '#EA4335',
    reminder: '60'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    description: 'Buy weekly groceries',
    startDate: new Date(2025, 3, 3, 18, 0), // April 3, 2025, 6:00 PM
    endDate: new Date(2025, 3, 3, 19, 0), // April 3, 2025, 7:00 PM
    location: 'Supermarket',
    color: '#34A853',
    reminder: '15'
  },
  {
    id: '4',
    title: 'Birthday Party',
    description: 'Sarah\'s birthday celebration',
    startDate: new Date(2025, 3, 15, 19, 0), // April 15, 2025, 7:00 PM
    endDate: new Date(2025, 3, 15, 22, 0), // April 15, 2025, 10:00 PM
    location: 'Pizzeria Downtown',
    color: '#FBBC05',
    reminder: '1440' // 1 day before
  },
  {
    id: '5',
    title: 'Project Deadline',
    description: 'Final submission for the Q2 project',
    startDate: new Date(2025, 3, 30, 0, 0), // April 30, 2025, all day
    endDate: new Date(2025, 3, 30, 23, 59), // April 30, 2025, end of day
    allDay: true,
    color: '#EA4335',
    reminder: '2880' // 2 days before
  },
  {
    id: '6',
    title: 'Yoga Class',
    description: 'Weekly yoga session',
    startDate: new Date(2025, 3, 7, 8, 0), // April 7, 2025, 8:00 AM
    endDate: new Date(2025, 3, 7, 9, 0), // April 7, 2025, 9:00 AM
    location: 'Fitness Center',
    color: '#8E24AA',
    reminder: '30',
    recurring: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    }
  }
];

interface CalendarViewProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  searchTerm?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isCreateDialogOpen?: boolean;
  setIsCreateDialogOpen?: (open: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  viewMode, 
  searchTerm = '', 
  weekStartsOn = 1,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [localCreateDialogOpen, setLocalCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  const effectiveCreateDialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localCreateDialogOpen;
  const effectiveSetCreateDialogOpen = setIsCreateDialogOpen || setLocalCreateDialogOpen;

  const filteredEvents = events.filter(event => 
    searchTerm ? 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    : true
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '10:00',
      endDate: new Date(),
      endTime: '11:00',
      allDay: false,
      location: '',
      color: '#4285F4',
      image: '',
      recurringType: 'none',
      recurringDaysOfWeek: [],
      reminder: '30',
    },
  });

  useEffect(() => {
    if (selectedEvent && isEditMode) {
      const startHours = selectedEvent.startDate.getHours().toString().padStart(2, '0');
      const startMinutes = selectedEvent.startDate.getMinutes().toString().padStart(2, '0');
      const endHours = selectedEvent.endDate.getHours().toString().padStart(2, '0');
      const endMinutes = selectedEvent.endDate.getMinutes().toString().padStart(2, '0');
      
      form.reset({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        startDate: selectedEvent.startDate,
        startTime: `${startHours}:${startMinutes}`,
        endDate: selectedEvent.endDate,
        endTime: `${endHours}:${endMinutes}`,
        allDay: selectedEvent.allDay || false,
        location: selectedEvent.location || '',
        color: selectedEvent.color || '#4285F4',
        image: selectedEvent.image || '',
        recurringType: selectedEvent.recurring ? selectedEvent.recurring.frequency : 'none',
        recurringEndDate: selectedEvent.recurring?.endDate,
        recurringOccurrences: selectedEvent.recurring?.occurrences?.toString(),
        recurringDaysOfWeek: selectedEvent.recurring?.daysOfWeek?.map(day => day.toString()) || [],
        reminder: selectedEvent.reminder || '30',
      });
      
      if (selectedEvent.image) {
        setSelectedImage(selectedEvent.image);
      } else {
        setSelectedImage(null);
      }
    }
  }, [selectedEvent, isEditMode, form]);

  const handleCreateEvent = () => {
    form.reset({
      title: '',
      description: '',
      startDate: date,
      startTime: '10:00',
      endDate: date,
      endTime: '11:00',
      allDay: false,
      location: '',
      color: '#4285F4',
      image: '',
      recurringType: 'none',
      recurringDaysOfWeek: [],
      reminder: '30',
    });
    setIsEditMode(false);
    effectiveSetCreateDialogOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditEvent = () => {
    setIsEditMode(true);
    setIsViewDialogOpen(false);
    effectiveSetCreateDialogOpen(true);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsViewDialogOpen(false);
      toast({
        title: "Event deleted",
        description: `"${selectedEvent.title}" has been removed from your calendar.`
      });
      setSelectedEvent(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        form.setValue('image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    form.setValue('image', '');
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const startTimeParts = values.startTime ? values.startTime.split(':').map(Number) : [0, 0];
      const endTimeParts = values.endTime ? values.endTime.split(':').map(Number) : [0, 0];
      
      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(startTimeParts[0], startTimeParts[1], 0);
      
      const endDateTime = new Date(values.endDate);
      endDateTime.setHours(endTimeParts[0], endTimeParts[1], 0);
      
      let recurring = undefined;
      if (values.recurringType && values.recurringType !== 'none') {
        recurring = {
          frequency: values.recurringType as 'daily' | 'weekly' | 'monthly' | 'yearly',
          interval: 1,
          endDate: values.recurringEndDate,
          occurrences: values.recurringOccurrences ? parseInt(values.recurringOccurrences) : undefined,
          daysOfWeek: values.recurringDaysOfWeek ? values.recurringDaysOfWeek.map(day => parseInt(day)) : undefined,
        };
      }
      
      const newEvent: Event = {
        id: selectedEvent && isEditMode ? selectedEvent.id : Date.now().toString(),
        title: values.title,
        description: values.description,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: values.allDay,
        location: values.location,
        color: values.color,
        image: values.image,
        recurring,
        reminder: values.reminder,
      };
      
      if (selectedEvent && isEditMode) {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? newEvent : event
        ));
        toast({
          title: "Event updated",
          description: `Changes to "${newEvent.title}" have been saved.`
        });
      } else {
        setEvents([...events, newEvent]);
        toast({
          title: "Event created",
          description: `"${newEvent.title}" has been added to your calendar.`
        });
      }
      
      effectiveSetCreateDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error creating/updating event:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const isDayWithEvents = (day: Date) => {
    return filteredEvents.some(event => 
      isSameDay(event.startDate, day) || isSameDay(event.endDate, day)
    );
  };

  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReminderLabel = (value: string) => {
    const option = reminderOptions.find(opt => opt.value === value);
    return option ? option.label : "No reminder";
  };

  return (
    <div className="space-y-4">
      <Dialog open={effectiveCreateDialogOpen} onOpenChange={effectiveSetCreateDialogOpen}>
        <DialogContent className="max-w-md md:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription className="sr-only">
              {isEditMode ? 'Edit your event details' : 'Fill in the details for your new event'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date*</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time*</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              disabled={form.watch('allDay')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date*</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time*</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              disabled={form.watch('allDay')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="allDay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>All day event</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image (Optional)</FormLabel>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                          accept="image/*"
                        />
                        {selectedImage ? (
                          <div className="relative">
                            <img 
                              src={selectedImage} 
                              alt="Event" 
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-12 border-dashed flex gap-2"
                              onClick={handleImageButtonClick}
                            >
                              <Image className="h-4 w-4" />
                              <span>Add Image</span>
                            </Button>
                          </FormControl>
                        )}
                        <FormDescription>
                          Add an optional image for your event.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter event description..." 
                            {...field} 
                            className="resize-none h-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          Location (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Color (Optional)</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {colorOptions.map((color) => (
                            <div 
                              key={color.value}
                              className={cn(
                                "h-8 w-8 rounded-full cursor-pointer border-2",
                                field.value === color.value ? "border-black dark:border-white" : "border-transparent"
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.label}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recurringType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recurrence pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recurringOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('recurringType') === 'weekly' && (
                    <FormField
                      control={form.control}
                      name="recurringDaysOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat on</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {weekDays.map((day, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-8 w-8 p-0",
                                  field.value?.includes(index.toString())
                                    ? "bg-primary text-primary-foreground"
                                    : ""
                                )}
                                onClick={() => {
                                  const currentValue = field.value || [];
                                  const dayStr = index.toString();
                                  
                                  if (currentValue.includes(dayStr)) {
                                    field.onChange(currentValue.filter(d => d !== dayStr));
                                  } else {
                                    field.onChange([...currentValue, dayStr]);
                                  }
                                }}
                              >
                                {day[0]}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="reminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                          Reminder (Optional)
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reminder time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reminderOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        effectiveSetCreateDialogOpen(false);
                        setIsEditMode(false);
                        setSelectedImage(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-todo-purple hover:bg-todo-purple/90">
                      {isEditMode ? 'Save Changes' : 'Create Event'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-md max-h-[90vh]">
            <DialogHeader>
              <div className="flex justify-between items-center mb-1">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <DialogTitle className="flex-1 text-left">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Event details for {selectedEvent.title}
                </DialogDescription>
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleEditEvent}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDeleteEvent}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 p-1">
                {selectedEvent.image && (
                  <div className="mb-4">
                    <img 
                      src={selectedEvent.image} 
                      alt={selectedEvent.title} 
                      className="w-full h-48 object-cover rounded-md" 
                    />
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedEvent.allDay 
                        ? 'All day' 
                        : `${getFormattedTime(selectedEvent.startDate)} - ${getFormattedTime(selectedEvent.endDate)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedEvent.startDate, 'EEEE, MMMM d, yyyy')}
                      {!isSameDay(selectedEvent.startDate, selectedEvent.endDate) && (
                        <> - {format(selectedEvent.endDate, 'EEEE, MMMM d, yyyy')}</>
                      )}
                    </p>
                    {selectedEvent.recurring && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Recurring: </span>
                        {selectedEvent.recurring.frequency.charAt(0).toUpperCase() + selectedEvent.recurring.frequency.slice(1)}
                        {selectedEvent.recurring.frequency === 'weekly' && selectedEvent.recurring.daysOfWeek && (
                          <span> on {selectedEvent.recurring.daysOfWeek.map(day => weekDays[day]).join(', ')}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
                
                {selectedEvent.reminder && selectedEvent.reminder !== 'none' && (
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{getReminderLabel(selectedEvent.reminder)}</p>
                    </div>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      <div className="flex justify-between mb-2">
        <Button 
          className="bg-todo-purple hover:bg-todo-purple/90 gap-2"
          onClick={handleCreateEvent}
        >
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>
      
      {viewMode === 'month' && (
        <MonthView 
          date={date} 
          setDate={setDate}
          events={filteredEvents}
          handleViewEvent={handleViewEvent}
          theme={theme}
          weekStartsOn={weekStartsOn}
        />
      )}
      
      {viewMode === 'week' && (
        <WeekView 
          date={date} 
          setDate={setDate}
          events={filteredEvents}
          handleViewEvent={handleViewEvent}
          theme={theme}
          weekStartsOn={weekStartsOn}
        />
      )}
      
      {viewMode === 'day' && (
        <DayView 
          date={date} 
          setDate={setDate}
          events={filteredEvents}
          handleViewEvent={handleViewEvent}
          theme={theme}
        />
      )}
      
      {viewMode === 'agenda' && (
        <AgendaView 
          date={date}
          setDate={setDate}
          events={filteredEvents}
          handleViewEvent={handleViewEvent}
          theme={theme}
        />
      )}
    </div>
  );
};

export default CalendarView;
