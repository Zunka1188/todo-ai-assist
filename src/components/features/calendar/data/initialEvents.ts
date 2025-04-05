
import { Event } from '../types/event';

export const initialEvents: Event[] = [
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
      daysOfWeek: [1] // Monday
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
      daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
    }
  },
  {
    id: '7',
    title: 'Coffee Tasting Event',
    description: 'Join us for an exclusive coffee bean tasting experience featuring specialty beans from around the world. Learn brewing techniques and flavor profiles from expert baristas.',
    startDate: new Date(), // Today's date
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Today's date + 2 hours
    location: 'Artisan Coffee House',
    color: '#795548', // Coffee brown color
    reminder: '60',
    image: 'https://picsum.photos/id/766/800/600' // Coffee beans image
  }
];
