
import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarView from '@/components/features/calendar/CalendarView';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      {/* Header section that matches Shopping and Documents pages */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="p-1 rounded-md hover:bg-secondary touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Event
          </Button>
        </div>
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search events..."
          className="w-full"
        />
      </div>

      <div className="flex">
        <Tabs defaultValue="month" value={viewMode} onValueChange={value => setViewMode(value as 'month' | 'week' | 'day' | 'agenda')} className="w-full">
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
    </div>
  );
};

export default CalendarPage;
