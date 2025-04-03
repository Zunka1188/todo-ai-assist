
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import CalendarView from '@/components/features/calendar/CalendarView';

const CalendarPage = () => {
  return (
    <div className="space-y-6 py-4">
      <AppHeader 
        title="Calendar" 
        subtitle="Manage your schedule and events"
      />
      <CalendarView />
    </div>
  );
};

export default CalendarPage;
