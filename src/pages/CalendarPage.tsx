
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/page-header';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const CalendarPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('day');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();

  const handleAddItem = () => {
    setCreateDialogOpen(true);
    setShowFileUploader(false);
  };

  // Handle dialog close without navigation
  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
  };

  // Handle file uploader state without navigation
  const handleFileUploaderChange = (open: boolean) => {
    setShowFileUploader(open);
  };

  return (
    <PageLayout maxWidth="full">
      <PageHeader
        title="Calendar"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={false}
        showBackButton={true}
        backTo="/"
        rightContent={
          <Button className="flex items-center gap-1" onClick={handleAddItem}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        }
      />

      <div className="flex w-full">
        <Tabs 
          defaultValue="day" 
          value={viewMode} 
          onValueChange={value => setViewMode(value as 'month' | 'week' | 'day' | 'agenda')} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator className="my-2" />
      
      <div className={`flex-1 overflow-hidden w-full ${theme === 'dark' ? 'text-white' : ''}`}>
        <CalendarView 
          viewMode={viewMode} 
          searchTerm={searchTerm} 
          weekStartsOn={1} // Set to 1 for Monday (0 is Sunday)
          isCreateDialogOpen={createDialogOpen} 
          setIsCreateDialogOpen={handleDialogClose}
          isFileUploaderOpen={showFileUploader}
          setIsFileUploaderOpen={handleFileUploaderChange}
        />
      </div>
    </PageLayout>
  );
};

export default CalendarPage;
