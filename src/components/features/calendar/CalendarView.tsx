import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, CheckSquare, Bell } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
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

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  reminder?: string;
}

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  time?: string;
  location?: string;
  reminder?: string;
};

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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date(),
  time: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['event', 'task']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  reminder: z.string().default("30"),
});

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(2025, 3, 5), // April 5, 2025
    time: '10:00 AM',
    location: 'Conference Room A',
    reminder: '30'
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    date: new Date(2025, 3, 8), // April 8, 2025
    time: '2:30 PM',
    location: 'Dental Clinic',
    reminder: '60'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    date: new Date(2025, 3, 3), // April 3, 2025 (today)
    time: '6:00 PM',
    location: 'Supermarket',
    reminder: '15'
  }
];

const initialTasks: Task[] = [
  { id: 1, title: 'Buy groceries', completed: false, priority: 'high', dueDate: '2025-04-03', time: '5:00 PM', location: 'Grocery Store', reminder: '30' },
  { id: 2, title: 'Call dentist', completed: false, priority: 'medium', dueDate: '2025-04-03', time: '2:00 PM', reminder: '15' },
  { id: 3, title: 'Finish presentation', completed: true, priority: 'low', dueDate: '2025-04-03', reminder: 'none' },
];

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      time: '',
      location: '',
      type: 'event',
      priority: 'medium',
      reminder: '30',
    },
  });

  const onOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      form.reset({
        title: '',
        date: date || new Date(),
        time: '',
        location: '',
        type: 'event',
        priority: 'medium',
        reminder: '30',
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.type === 'event') {
      const newEvent: Event = {
        id: (events.length + 1).toString(),
        title: values.title,
        date: values.date,
        time: values.time,
        location: values.location,
        reminder: values.reminder,
      };
      setEvents([...events, newEvent]);
    } else {
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      const newTask: Task = {
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
        title: values.title,
        completed: false,
        priority: values.priority || 'medium',
        dueDate: formattedDate,
        time: values.time,
        location: values.location,
        reminder: values.reminder,
      };
      setTasks([...tasks, newTask]);
    }
    setIsDialogOpen(false);
  };

  const formattedToday = date ? format(date, 'yyyy-MM-dd') : '';

  const selectedDateEvents = events.filter(
    (event) => 
      date && 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  const selectedDateTasks = tasks.filter(
    (task) => task.dueDate === formattedToday
  );

  const combinedItems = [
    ...selectedDateEvents.map(event => ({
      ...event,
      itemType: 'event' as const,
      completed: false,
    })),
    ...selectedDateTasks.map(task => ({
      ...task,
      itemType: 'task' as const,
      date: new Date(task.dueDate),
    })),
  ];

  const isDayWithItem = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    
    return events.some(
      (event) => 
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    ) || tasks.some(
      (task) => task.dueDate === formattedDay
    );
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getReminderLabel = (value: string) => {
    const option = reminderOptions.find(opt => opt.value === value);
    return option ? option.label : "No reminder";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-auto flex justify-center">
          <div className="max-w-[350px]">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border shadow bg-white dark:bg-gray-800 dark:border-gray-700 mx-auto pointer-events-auto"
              modifiers={{
                event: (date) => isDayWithItem(date),
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: 'bold', 
                  backgroundColor: 'rgba(155, 135, 245, 0.1)',
                  color: '#7E69AB',
                  borderColor: '#9b87f5' 
                }
              }}
            />
          </div>
        </div>

        <div className="md:flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-todo-purple" />
              {date ? (
                <span>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              ) : 'No date selected'}
            </h3>
            
            <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-todo-purple hover:bg-todo-purple/90">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event or Task</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Type</FormLabel>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                value="event"
                                checked={field.value === 'event'}
                                onChange={() => field.onChange('event')}
                                className="h-4 w-4"
                              />
                              Event
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                value="task"
                                checked={field.value === 'task'}
                                onChange={() => field.onChange('task')}
                                className="h-4 w-4"
                              />
                              Task
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('type') === 'task' && (
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Priority</FormLabel>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="low"
                                  checked={field.value === 'low'}
                                  onChange={() => field.onChange('low')}
                                  className="h-4 w-4"
                                />
                                Low
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="medium"
                                  checked={field.value === 'medium'}
                                  onChange={() => field.onChange('medium')}
                                  className="h-4 w-4"
                                />
                                Medium
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="high"
                                  checked={field.value === 'high'}
                                  onChange={() => field.onChange('high')}
                                  className="h-4 w-4"
                                />
                                High
                              </label>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3:00 PM" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reminder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Bell className="h-4 w-4 mr-2 text-todo-purple" />
                            Reminder
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
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-todo-purple hover:bg-todo-purple/90">
                        Add {form.watch('type') === 'event' ? 'Event' : 'Task'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {combinedItems.length > 0 ? (
            <div className="space-y-3">
              {combinedItems.map((item) => (
                <div 
                  key={`${item.itemType}-${item.id}`}
                  className={cn(
                    "p-4 rounded-lg border border-border",
                    "bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow",
                    item.itemType === 'task' && item.completed && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {item.itemType === 'task' && (
                      <button 
                        className={cn(
                          "w-5 h-5 rounded-md border mr-1 flex-shrink-0 mt-1",
                          item.completed ? "bg-todo-purple border-todo-purple" : "border-gray-300 dark:border-gray-500",
                          {
                            "border-red-400": !item.completed && item.priority === 'high',
                            "border-yellow-400": !item.completed && item.priority === 'medium',
                            "border-green-400": !item.completed && item.priority === 'low',
                          }
                        )}
                        onClick={() => toggleTaskStatus(item.id as number)}
                      >
                        {item.completed && (
                          <CheckSquare className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium text-todo-black dark:text-white",
                        item.itemType === 'task' && item.completed && "line-through text-muted-foreground"
                      )}>
                        {item.title}
                        <span className="ml-2 text-xs text-todo-purple bg-todo-purple/10 px-2 py-0.5 rounded">
                          {item.itemType === 'event' ? 'Event' : 'Task'}
                        </span>
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {item.time && <p>⏰ {item.time}</p>}
                        {item.location && <p>📍 {item.location}</p>}
                        {item.reminder && item.reminder !== 'none' && (
                          <p className="flex items-center">
                            <Bell className="h-3 w-3 mr-1 text-todo-purple" />
                            {getReminderLabel(item.reminder)}
                          </p>
                        )}
                        {item.itemType === 'task' && item.priority && (
                          <p>
                            🔔 Priority: 
                            <span className={cn(
                              "ml-1 font-medium",
                              item.priority === 'high' ? "text-red-500" : 
                              item.priority === 'medium' ? "text-yellow-500" : 
                              "text-green-500"
                            )}>
                              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No events or tasks scheduled for this day</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
