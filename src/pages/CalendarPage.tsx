
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/page-header';
import { useTheme } from '@/hooks/use-theme';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, PlusCircle, Calendar, Upload } from 'lucide-react';

const CalendarPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('day');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();

  const handleAddItem = () => {
    setCreateDialogOpen(true);
  };

  return (
    <PageLayout maxWidth="full">
      <PageHeader
        title="Calendar"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        addItemButton={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Event
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddItem} className="cursor-pointer">
                <Calendar className="h-4 w-4 mr-2" />
                New Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setShowFileUploader(true);
                  setCreateDialogOpen(false);
                }}
                className="cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          setIsCreateDialogOpen={setCreateDialogOpen} 
        />
      </div>
    </PageLayout>
  );
};

export default CalendarPage;
