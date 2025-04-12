
import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  weekStart: Date;
  weekEnd: Date;
  prevWeek: () => void;
  nextWeek: () => void;
  theme: string;
}

const Navigation: React.FC<NavigationProps> = ({ weekStart, weekEnd, prevWeek, nextWeek, theme }) => {
  const { isMobile } = useIsMobile();
  
  // Handle previous week navigation with event stopping
  const handlePrevWeek = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    prevWeek();
  };

  // Handle next week navigation with event stopping
  const handleNextWeek = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    nextWeek();
  };
  
  return (
    <div className="flex items-center justify-between">
      <h2 className={cn("text-xl font-semibold", theme === 'light' ? "text-foreground" : "text-white", isMobile ? "text-[0.95rem] leading-tight" : "")}>
        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </h2>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevWeek} 
          aria-label="Previous week" 
          className="tap-target"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextWeek} 
          aria-label="Next week" 
          className="tap-target"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
