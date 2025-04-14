
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { CalendarProvider, useCalendar } from '@/components/features/calendar/CalendarContext';
import CalendarHeader from '@/components/features/calendar/ui/CalendarHeader';
import CalendarContent from '@/components/features/calendar/ui/CalendarContent';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useCalendarSharing } from '@/components/features/calendar/hooks/useCalendarSharing';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/components/features/calendar/types/event';

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

  const [shareEvent, setShareEvent] = useState<Event | null>(null);
  const { shareEvent: generateShareLink } = useCalendarSharing();
  const { toast } = useToast();

  // Handle sharing an event
  const handleShareEvent = (event: Event) => {
    setShareEvent(event);
    setInviteDialogOpen(true);
  };

  // Handle generation of share link
  const handleGenerateShareLink = (link: string) => {
    if (shareEvent) {
      try {
        const shareLink = generateShareLink(shareEvent);
        if (shareLink) {
          toast({
            title: "Share link created",
            description: "The link has been copied to clipboard"
          });
          navigator.clipboard.writeText(shareLink);
        }
      } catch (error) {
        console.error("Failed to generate share link:", error);
        toast({
          title: "Error",
          description: "Failed to create share link",
          variant: "destructive"
        });
      }
    }
    
    // Call the original handler for any additional functionality
    if (handleInviteSent) {
      handleInviteSent(link);
    }
  };

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
      <ErrorBoundary>
        <div className="flex flex-col h-full">
          <CalendarHeader />
          <div className="flex-1 overflow-auto">
            <CalendarContent />
          </div>
        </div>
        
        <InviteDialog 
          isOpen={inviteDialogOpen}
          setIsOpen={setInviteDialogOpen}
          event={shareEvent}
          onShareLink={handleGenerateShareLink}
        />
        
        <Toaster />
      </ErrorBoundary>
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
