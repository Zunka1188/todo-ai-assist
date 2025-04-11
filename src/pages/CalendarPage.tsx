import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/page-header';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Plus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InviteDialog from '@/components/features/calendar/dialogs/InviteDialog';
import ErrorBoundary from '@/components/features/calendar/ErrorBoundary';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('day');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error("[ERROR] Calendar: Failed to load calendar data", error);
        setPageError("Failed to load calendar data. Please try again.");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load calendar data",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
      }
    };

    loadCalendarData();
  }, [toast]);

  const handleAddItem = useCallback(() => {
    try {
      setCreateDialogOpen(true);
      setShowFileUploader(false);
    } catch (error) {
      console.error("[ERROR] Calendar: Failed to open create dialog", error);
      toast({
        title: "Error",
        description: "Failed to open create dialog",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  const handleDialogClose = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
  }, []);

  const handleFileUploaderChange = useCallback((open: boolean) => {
    setShowFileUploader(open);
  }, []);
  
  const handleViewModeChange = useCallback((value: string) => {
    try {
      setViewMode(value as 'month' | 'week' | 'day' | 'agenda');
      toast({
        title: "View Changed",
        description: `Calendar view set to ${value}`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("[ERROR] Calendar: Failed to change view mode", error);
      toast({
        title: "Error",
        description: "Failed to change view mode",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  const handleShareCalendar = useCallback(() => {
    try {
      setInviteDialogOpen(true);
    } catch (error) {
      console.error("[ERROR] Calendar: Failed to open invite dialog", error);
      toast({
        title: "Error",
        description: "Failed to open invite dialog",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  }, [toast]);

  const handleInviteSent = useCallback((link: string) => {
    toast({
      title: "Invitation Link Generated",
      description: "The link has been created and is ready to share",
      role: "status",
      "aria-live": "polite"
    });
  }, [toast]);

  if (isLoading) {
    return (
      <PageLayout maxWidth="full" className="flex flex-col h-[calc(100vh-4rem)]" noPadding>
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </PageLayout>
    );
  }

  if (pageError) {
    return (
      <PageLayout maxWidth="full" className="flex flex-col h-[calc(100vh-4rem)]" noPadding>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-center">{pageError}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      maxWidth="full" 
      className="flex flex-col h-[calc(100vh-4rem)] pb-0"
      noPadding
    >
      <div className="px-4 pt-4 pb-2 sticky top-0 z-30 bg-background border-b">
        <PageHeader 
          title="Calendar"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={false}
          showBackButton={true}
          backTo="/"
          className="mb-3"
          rightContent={
            <div className="flex space-x-2">
              <Button 
                onClick={handleShareCalendar} 
                size={isMobile ? "sm" : "default"}
                variant="outline"
                className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring touch-manipulation"
                aria-label="Share calendar"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {isMobile ? "" : "Invite"}
              </Button>
              <Button 
                onClick={handleAddItem} 
                size={isMobile ? "sm" : "default"}
                className="bg-todo-purple hover:bg-todo-purple/90 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring touch-manipulation"
                aria-label="Add new event"
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
            <TabsList className="grid grid-cols-4 w-full shadow-sm">
              <TabsTrigger 
                value="month" 
                className={cn(
                  isMobile ? "text-xs py-1.5" : "",
                  "touch-manipulation"
                )}
                aria-label="Month view"
              >
                Month
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className={cn(
                  isMobile ? "text-xs py-1.5" : "",
                  "touch-manipulation"
                )}
                aria-label="Week view"
              >
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="day" 
                className={cn(
                  isMobile ? "text-xs py-1.5" : "",
                  "touch-manipulation"
                )}
                aria-label="Day view"
              >
                Day
              </TabsTrigger>
              <TabsTrigger 
                value="agenda" 
                className={cn(
                  isMobile ? "text-xs py-1.5" : "",
                  "touch-manipulation"
                )}
                aria-label="Agenda view"
              >
                Upcoming
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className={cn(
        "flex-1 overflow-hidden w-full",
        "bg-muted/10",
        theme === 'dark' ? 'text-white' : ''
      )}>
        <div className="h-full overflow-y-auto">
          <div className="px-4 py-3">
            <ErrorBoundary>
              <CalendarView 
                viewMode={viewMode} 
                searchTerm={debouncedSearchTerm} 
                weekStartsOn={1} 
                isCreateDialogOpen={createDialogOpen} 
                setIsCreateDialogOpen={handleDialogClose}
                isFileUploaderOpen={showFileUploader}
                setIsFileUploaderOpen={handleFileUploaderChange}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <InviteDialog 
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
        onShareLink={handleInviteSent}
      />
    </PageLayout>
  );
};

export default CalendarPage;
