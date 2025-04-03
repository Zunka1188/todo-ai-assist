
import React, { useState } from 'react';
import { ArrowLeft, Search, List, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import CalendarView from '@/components/features/calendar/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-4 py-4 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Calendar" 
          subtitle="Manage your schedule, events and tasks"
          className="py-0"
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex">
          <Tabs 
            defaultValue="month" 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day' | 'agenda')} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Separator className="my-2" />
      
      <div className="flex-1 overflow-hidden">
        <CalendarView 
          viewMode={viewMode} 
          searchTerm={searchTerm}
          weekStartsOn={1} // Set to 1 for Monday (0 is Sunday)
        />
      </div>
    </div>
  );
};

export default CalendarPage;
