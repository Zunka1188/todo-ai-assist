
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { CalendarProvider, useCalendar } from '@/components/features/calendar/CalendarContext';
import CalendarHeader from '@/components/features/calendar/ui/CalendarHeader';
import CalendarContent from '@/components/features/calendar/ui/CalendarContent';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';

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
      <div className="flex flex-col h-full">
        <CalendarHeader />
        <div className="flex-1 overflow-auto">
          <CalendarContent />
        </div>
      </div>
      
      <InviteDialog 
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
        onShareLink={handleInviteSent}
      />
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
const CalendarPage: React.FC<CalendarPageProps> = ({ initialView }) => {
  return (
    <CalendarProvider initialView={initialView}>
      <CalendarPageContent />
    </CalendarProvider>
  );
};

export default CalendarPage;
