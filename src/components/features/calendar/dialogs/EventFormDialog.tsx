
import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, MapPin, Bell, Image, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formSchema, colorOptions, reminderOptions, recurringOptions } from '../types/form';
import { Event } from '../types/event';
import { weekDays } from '../utils/dateUtils';

interface EventFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (event: Event) => void;
  selectedEvent: Event | null;
  isEditMode: boolean;
}

const EventFormDialog = ({ isOpen, setIsOpen, onSubmit, selectedEvent, isEditMode }: EventFormDialogProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      reminder: '30'
    }
  });

  // Set form values when editing an event
  React.useEffect(() => {
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
        reminder: selectedEvent.reminder || '30'
      });
      
      if (selectedEvent.image) {
        setSelectedImage(selectedEvent.image);
      } else {
        setSelectedImage(null);
      }
    }
  }, [selectedEvent, isEditMode, form]);

  // Handle image upload
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

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
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
          daysOfWeek: values.recurringDaysOfWeek ? values.recurringDaysOfWeek.map(day => parseInt(day)) : undefined
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
        reminder: values.reminder
      };
      
      onSubmit(newEvent);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating/updating event:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({
                field
              }) => <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({
                  field
                }) => <FormItem className="flex flex-col">
                      <FormLabel>Start Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>} />
                  
                  <FormField control={form.control} name="startTime" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Start Time*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={form.watch('allDay')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="endDate" render={({
                  field
                }) => <FormItem className="flex flex-col">
                      <FormLabel>End Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>} />
                  
                  <FormField control={form.control} name="endTime" render={({
                  field
                }) => <FormItem>
                      <FormLabel>End Time*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={form.watch('allDay')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                </div>
                
                <FormField control={form.control} name="allDay" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>All day event</FormLabel>
                    </div>
                  </FormItem>} />
                
                <FormField control={form.control} name="image" render={({
                field
              }) => <FormItem>
                    <FormLabel>Image (Optional)</FormLabel>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    {selectedImage ? <div className="relative">
                        <img src={selectedImage} alt="Event" className="w-full h-40 object-cover rounded-md" />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div> : <FormControl>
                        <Button type="button" variant="outline" className="w-full h-12 border-dashed flex gap-2" onClick={handleImageButtonClick}>
                          <Image className="h-4 w-4" />
                          <span>Add Image</span>
                        </Button>
                      </FormControl>}
                    <FormDescription>
                      Add an optional image for your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>} />
                
                <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter event description..." {...field} className="resize-none h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
                
                <FormField control={form.control} name="location" render={({
                field
              }) => <FormItem>
                    <FormLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      Location (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
                
                <FormField control={form.control} name="color" render={({
                field
              }) => <FormItem>
                    <FormLabel>Event Color (Optional)</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => <div key={color.value} className={cn("h-8 w-8 rounded-full cursor-pointer border-2", field.value === color.value ? "border-black dark:border-white" : "border-transparent")} style={{
                  backgroundColor: color.value
                }} onClick={() => field.onChange(color.value)} title={color.label} />)}
                    </div>
                    <FormMessage />
                  </FormItem>} />
                
                <FormField control={form.control} name="recurringType" render={({
                field
              }) => <FormItem>
                    <FormLabel>Recurrence (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recurringOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
                
                {form.watch('recurringType') === 'weekly' && <FormField control={form.control} name="recurringDaysOfWeek" render={({
                field
              }) => <FormItem>
                      <FormLabel>Repeat on</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day, index) => <Button key={index} type="button" variant="outline" className={cn("h-8 w-8 p-0", field.value?.includes(index.toString()) ? "bg-primary text-primary-foreground" : "")} onClick={() => {
                  const currentValue = field.value || [];
                  const dayStr = index.toString();
                  if (currentValue.includes(dayStr)) {
                    field.onChange(currentValue.filter(d => d !== dayStr));
                  } else {
                    field.onChange([...currentValue, dayStr]);
                  }
                }}>
                            {day[0]}
                          </Button>)}
                      </div>
                      <FormMessage />
                    </FormItem>} />}
                
                <FormField control={form.control} name="reminder" render={({
                field
              }) => <FormItem>
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
                        {reminderOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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
  );
};

export default EventFormDialog;
