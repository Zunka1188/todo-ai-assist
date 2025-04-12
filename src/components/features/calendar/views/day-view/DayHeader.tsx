
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface DayHeaderProps {
  date: Date;
  theme: string;
  prevDay: () => void;
  nextDay: () => void;
}

const DayHeader: React.FC<DayHeaderProps> = ({
  date,
  theme,
  prevDay,
  nextDay
}) => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const isCurrentDate = isToday(date);
  
  const [isEditMode, setIsEditMode] = React.useState(() => {
    // Check localStorage when component mounts
    return localStorage.getItem('calendar-edit-mode') === 'true';
  });
  
  const toggleEditMode = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    
    // Store in localStorage
    localStorage.setItem('calendar-edit-mode', newMode.toString());
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent('calendar-edit-mode-change', { 
        detail: { isEditMode: newMode } 
      })
    );
    
    // Show toast message
    toast({
      title: newMode ? "Edit mode enabled" : "Edit mode disabled",
      description: newMode 
        ? "You can now drag and move events around." 
        : "Calendar has returned to view mode.",
      role: "status",
      "aria-live": "polite"
    });
  };
  
  return (
    <div className="flex items-center justify-between p-2 border-b mb-1">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevDay}
          className="h-8 w-8"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className={cn("text-sm font-medium", isMobile ? "" : "min-w-[150px] text-center")}>
          {format(date, isMobile ? 'MMM d' : 'MMMM d, yyyy')}
          {isCurrentDate && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              Today
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={nextDay}
          className="h-8 w-8"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground mr-1">
          {isEditMode ? "Edit Mode" : "View Mode"}
        </span>
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <Switch
            checked={isEditMode}
            onCheckedChange={toggleEditMode}
            aria-label="Toggle edit mode"
          />
          <Edit className="h-3.5 w-3.5 ml-1.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default DayHeader;
