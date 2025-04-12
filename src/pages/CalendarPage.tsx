
import React, { useEffect, useRef } from 'react';
import { CalendarIcon } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { CalendarProvider, useCalendar } from '@/components/features/calendar/CalendarContext';
import CalendarHeader from '@/components/features/calendar/ui/CalendarHeader';
import CalendarContent from '@/components/features/calendar/ui/CalendarContent';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';
import { Toaster } from '@/components/ui/toaster';

/**
 * Calendar Page Content Component
 * Uses the CalendarContext for state management and displays the user's calendar
 * with various view modes (day, week, month, agenda).
 */
const CalendarPageContent: React.FC = () => {
  const { 
    isLoading, 
    pageError, 
    inviteDialogOpen, 
    handleInviteSent,
    retryDataFetch,
    setInviteDialogOpen
  } = useCalendar();
  
  // Track dialog state with ref for better state handling
  const inviteDialogOpenRef = useRef(inviteDialogOpen);
  
  useEffect(() => {
    inviteDialogOpenRef.current = inviteDialogOpen;
  }, [inviteDialogOpen]);
  
  // Set up auto retry
  useEffect(() => {
    const handleOnline = () => {
      if (pageError) {
        retryDataFetch();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [retryDataFetch, pageError]);

  return (
    <AppPage
      title="Calendar"
      icon={<CalendarIcon className="h-5 w-5" />}
      subtitle="Manage your events and appointments"
      isLoading={isLoading}
      error={pageError}
      onRetry={retryDataFetch}
      fullHeight
      noPadding
    >
      <div className="flex flex-col h-full" style={{ padding: '0 16px' }}>
        <CalendarHeader />
        <div className="flex-1 overflow-auto">
          <CalendarContent 
            disablePopups={true}
            maxTime="23:00"
            hideEmptyRows={true}
            deduplicateAllDay={true}
            constrainEvents={true}
          />
        </div>
      </div>
      
      <InviteDialog 
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
        onShareLink={handleInviteSent}
      />
      
      <Toaster />
    </AppPage>
  );
};

interface CalendarPageProps {
  initialView?: 'day' | 'week' | 'month' | 'agenda';
}

/**
 * Calendar Page Component
 * Wrapper component that provides the calendar context
 */
const CalendarPage: React.FC<CalendarPageProps> = ({ initialView = 'week' }) => {
  return (
    <CalendarProvider initialView={initialView}>
      <CalendarPageContent />
    </CalendarProvider>
  );
};

export default CalendarPage;
