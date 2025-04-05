
import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/page-header';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('day');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();

  return (
    <PageLayout fullHeight>
      {/* Use the standardized PageHeader component */}
      <PageHeader
        title="Calendar"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddItem={() => setCreateDialogOpen(true)}
        addItemLabel="+ Add Event"
      />

      <div className="flex">
        <Tabs defaultValue="day" value={viewMode} onValueChange={value => setViewMode(value as 'month' | 'week' | 'day' | 'agenda')} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator className="my-2" />
      
      <div className="flex-1 overflow-hidden">
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
