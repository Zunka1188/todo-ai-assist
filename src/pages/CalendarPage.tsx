
/**
 * Calendar Page Component
 * Displays the user's calendar with various view modes (day, week, month, agenda)
 * and allows for event management.
 */
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';
import { CalendarProvider, useCalendar } from '@/components/features/calendar/CalendarContext';
import CalendarHeader from '@/components/features/calendar/ui/CalendarHeader';
import CalendarContent from '@/components/features/calendar/ui/CalendarContent';
import LoadingState from '@/components/features/calendar/ui/LoadingState';
import ErrorState from '@/components/features/calendar/ui/ErrorState';

// The main content component that uses the calendar context
const CalendarPageContent: React.FC = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { 
    isLoading, 
    pageError, 
    inviteDialogOpen, 
    handleInviteSent 
  } = useCalendar();

  // Show loading state if data is loading
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state if there's an error
  if (pageError) {
    return <ErrorState error={pageError} />;
  }

  return (
    <PageLayout 
      maxWidth="full" 
      className="flex flex-col h-[calc(100vh-4rem)] pb-0"
      noPadding
    >
      <CalendarHeader isInviting={isInviting} isAdding={isAdding} />
      <CalendarContent />
      
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
    </PageLayout>
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
