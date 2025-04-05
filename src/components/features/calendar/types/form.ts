
import { z } from "zod";

export const formSchema = z.object({
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
  reminder: z.string().default("30")
});

export const reminderOptions = [
  { value: "none", label: "No reminder" },
  { value: "0", label: "At time of event" },
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
  { value: "2880", label: "2 days before" }
];

export const colorOptions = [
  { value: "#4285F4", label: "Blue" },
  { value: "#EA4335", label: "Red" },
  { value: "#FBBC05", label: "Yellow" },
  { value: "#34A853", label: "Green" },
  { value: "#8E24AA", label: "Purple" },
  { value: "#F4511E", label: "Orange" },
  { value: "#039BE5", label: "Light Blue" },
  { value: "#0B8043", label: "Dark Green" },
  { value: "#D50000", label: "Dark Red" },
  { value: "#FF6D00", label: "Dark Orange" }
];

export const recurringOptions = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" }
];
