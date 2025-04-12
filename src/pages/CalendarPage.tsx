
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';
import { CalendarProvider, useCalendar } from '@/components/features/calendar/CalendarContext';
import CalendarHeader from '@/components/features/calendar/ui/CalendarHeader';
import CalendarContent from '@/components/features/calendar/ui/CalendarContent';

/**
 * Calendar Page Component
 * Displays the user's calendar with various view modes (day, week, month, agenda)
 * and allows for event management.
 */
const CalendarPageContent: React.FC = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { 
    isLoading, 
    pageError, 
    inviteDialogOpen, 
    handleInviteSent 
  } = useCalendar();

  return (
    <AppPage
      title="Calendar"
      icon={<CalendarIcon className="h-5 w-5" />}
      subtitle="Manage your events and appointments"
      isLoading={isLoading}
      error={pageError}
      fullHeight
      noPadding
    >
      <div className="flex flex-col h-full">
        <CalendarHeader isInviting={isInviting} isAdding={isAdding} />
        <div className="flex-1 overflow-auto">
          <CalendarContent />
        </div>
      </div>
      
      <InviteDialog 
        isOpen={inviteDialogOpen}
        setIsOpen={(open) => {
          setIsInviting(false);
          // The actual state is managed in the context
        }}
        onShareLink={(link) => {
          handleInviteSent(link);
          setIsInviting(false);
        }}
      />
    </AppPage>
  );
};

// The wrapper component that provides the calendar context
const CalendarPage: React.FC = () => {
  return (
    <CalendarProvider>
      <CalendarPageContent />
    </CalendarProvider>
  );
};

export default CalendarPage;
