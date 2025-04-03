
import React, { useState } from 'react';
import { Camera, ArrowLeft, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScanToCalendarProps {
  onClose: () => void;
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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  reminder: z.string().default("30"),
});

type FormValues = z.infer<typeof formSchema>;

const ScanToCalendar: React.FC<ScanToCalendarProps> = ({ onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      time: "",
      location: "",
      notes: "",
      reminder: "30",
    },
  });

  const handleScan = () => {
    setScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      
      // Fill form with mock data (simulating extracted data from a scan)
      form.setValue("title", "Team Offsite Meeting");
      form.setValue("date", new Date(2025, 4, 15)); // May 15, 2025
      form.setValue("time", "10:00 AM");
      form.setValue("location", "Conference Room A, Building 2");
      form.setValue("notes", "Quarterly team meeting. Bring your presentation materials.");
      
      toast({
        title: "Scan Completed",
        description: "Event details extracted successfully",
      });
    }, 2000);
  };
  
  const onSubmit = (data: FormValues) => {
    toast({
      title: "Event Added",
      description: "Event has been added to your calendar",
    });
    
    console.log("Event data:", data);
    
    // Redirect to calendar page after adding event
    setTimeout(() => {
      navigate('/calendar');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">Scan to Calendar</h2>
        <div className="w-8" />
      </div>
      
      {!scanned ? (
        <Card className="border border-dashed border-todo-purple/40">
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-todo-purple/10 p-4 rounded-full">
              <Camera className="h-8 w-8 text-todo-purple" />
            </div>
            <p className="text-center text-muted-foreground">
              {scanning 
                ? "Scanning invitation..." 
                : "Scan an invitation to extract event details"}
            </p>
            <Button 
              onClick={handleScan} 
              disabled={scanning}
              className="bg-todo-purple hover:bg-todo-purple/90"
            >
              {scanning ? "Scanning..." : "Start Scanning"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3:00 PM" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes" 
                      className="min-h-[100px]"
                      {...field} 
                    />
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
            
            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
              >
                Add to Calendar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ScanToCalendar;
