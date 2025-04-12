
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2, Plus, UserPlus } from 'lucide-react';
import { useCalendar, ViewMode } from '../CalendarContext';
import { useIsMobile } from '@/hooks/use-mobile';

// Constants
const VIEW_LABELS: Record<ViewMode, string> = {
  month: "Month",
  week: "Week", 
  day: "Day",
  agenda: "Upcoming"
};

const CalendarHeader: React.FC = () => {
  const { 
    viewMode, 
    searchTerm,
    isAddingEvent,
    isInviting,
    setSearchTerm,
    setViewMode,
    todayButtonClick,
    nextPeriod,
    prevPeriod,
    getViewTitle,
    handleAddItem, 
    handleShareCalendar
  } = useCalendar();
  
  const { isMobile } = useIsMobile();

  return (
    <div className="px-4 pt-4 pb-2 sticky top-0 z-30 bg-background border-b">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        {/* Left section: Navigation and title */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={todayButtonClick}
            className="mr-2 text-sm"
          >
            Today
          </Button>
          
          <div className="flex items-center space-x-1 mr-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevPeriod}
              aria-label="Previous period"
              className="h-9 w-9 min-w-[36px]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextPeriod}
              aria-label="Next period"
              className="h-9 w-9 min-w-[36px]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className={cn(
            "font-semibold",
            isMobile ? "text-base" : "text-xl"
          )}>
            {getViewTitle()}
          </h2>
        </div>
        
        {/* Right section: Action buttons */}
        <div className="flex space-x-2 ml-auto sm:ml-0">
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
            disabled={isAddingEvent}
          >
            {isAddingEvent ? 
              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : 
              <Plus className="h-4 w-4 mr-1" />
            }
            {isMobile ? "Add" : "Add Event"}
          </Button>
        </div>
      </div>

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
