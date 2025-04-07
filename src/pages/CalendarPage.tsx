
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/page-header';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';

const CalendarPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('day');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleAddItem = useCallback(() => {
    setCreateDialogOpen(true);
    setShowFileUploader(false);
  }, []);

  // Handle dialog close without navigation
  const handleDialogClose = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
  }, []);

  // Handle file uploader state without navigation
  const handleFileUploaderChange = useCallback((open: boolean) => {
    setShowFileUploader(open);
  }, []);
  
  // Notification on view mode change
  const handleViewModeChange = useCallback((value: string) => {
    setViewMode(value as 'month' | 'week' | 'day' | 'agenda');
    toast({
      title: "View Changed",
      description: `Calendar view set to ${value}`
    });
  }, [toast]);

  // Handle sharing the calendar
  const handleShareCalendar = useCallback(() => {
    setInviteDialogOpen(true);
  }, []);

  // Handle invitation sent successfully
  const handleInviteSent = useCallback((link: string) => {
    toast({
      title: "Invitation Link Generated",
      description: "The link has been created and is ready to share"
    });
  }, [toast]);

  return (
    <PageLayout 
      maxWidth="full" 
      className="flex flex-col h-[calc(100vh-4rem)]"
      noPadding
    >
      <div className="px-4 pt-4 sm:px-6 md:px-8">
        <PageHeader 
          title="Calendar"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={false}
          showBackButton={true}
          backTo="/"
          rightContent={
            <div className="flex space-x-2">
              <Button 
                onClick={handleShareCalendar} 
                size={isMobile ? "sm" : "default"}
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {isMobile ? "" : "Invite"}
              </Button>
              <Button 
                onClick={handleAddItem} 
                size={isMobile ? "sm" : "default"}
                className="bg-todo-purple hover:bg-todo-purple/90 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isMobile ? "Add" : "Add Event"}
              </Button>
            </div>
          }
        />

        <div className="flex w-full">
          <Tabs 
            defaultValue="day" 
            value={viewMode} 
            onValueChange={handleViewModeChange} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="month" className={isMobile ? "text-xs py-1.5" : ""}>Month</TabsTrigger>
              <TabsTrigger value="week" className={isMobile ? "text-xs py-1.5" : ""}>Week</TabsTrigger>
              <TabsTrigger value="day" className={isMobile ? "text-xs py-1.5" : ""}>Day</TabsTrigger>
              <TabsTrigger value="agenda" className={isMobile ? "text-xs py-1.5" : ""}>Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="my-2" />
      </div>
      
      <div className={`flex-1 overflow-hidden w-full ${theme === 'dark' ? 'text-white' : ''}`}>
        <div className="px-4 sm:px-6 md:px-8">
          <CalendarView 
            viewMode={viewMode} 
            searchTerm={searchTerm} 
            weekStartsOn={1} 
            isCreateDialogOpen={createDialogOpen} 
            setIsCreateDialogOpen={handleDialogClose}
            isFileUploaderOpen={showFileUploader}
            setIsFileUploaderOpen={handleFileUploaderChange}
          />
        </div>
      </div>

      {/* Invite Dialog */}
      <InviteDialog 
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
        onShareLink={handleInviteSent}
      />
    </PageLayout>
  );
};

export default CalendarPage;
