
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { useCalendar, ViewMode } from '../CalendarContext';
import { useIsMobile } from '@/hooks/use-mobile';

// Constants
const VIEW_LABELS: Record<ViewMode, string> = {
  month: "Month",
  week: "Week", 
  day: "Day",
  agenda: "Upcoming"
};

interface CalendarHeaderProps {
  isInviting?: boolean;
  isAdding?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  isInviting = false, 
  isAdding = false 
}) => {
  const { 
    viewMode, 
    searchTerm,
    setSearchTerm,
    setViewMode,
    handleAddItem, 
    handleShareCalendar
  } = useCalendar();
  const { isMobile } = useIsMobile();

  return (
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
              disabled={isInviting}
            >
              {isInviting ? 
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : 
                <UserPlus className="h-4 w-4 mr-1" />
              }
              {isMobile ? "" : "Invite"}
            </Button>
            <Button 
              id="add-event-button"
              onClick={handleAddItem} 
              size={isMobile ? "sm" : "default"}
              className="bg-todo-purple hover:bg-todo-purple/90 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring touch-manipulation"
              aria-label="Add new event"
              disabled={isAdding}
            >
              {isAdding ? 
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : 
                <Plus className="h-4 w-4 mr-1" />
              }
              {isMobile ? "Add" : "Add Event"}
            </Button>
          </div>
        }
      />

      <div className="flex w-full">
        <Tabs 
          defaultValue={viewMode}
          value={viewMode} 
          onValueChange={(v) => setViewMode(v as ViewMode)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full shadow-sm">
            {Object.entries(VIEW_LABELS).map(([value, label]) => (
              <TabsTrigger 
                key={value}
                value={value} 
                className={cn(
                  isMobile ? "text-xs py-1.5" : "",
                  "touch-manipulation"
                )}
                aria-label={`${label} view`}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarHeader;
