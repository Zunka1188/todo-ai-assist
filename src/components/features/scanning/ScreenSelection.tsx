
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

interface ScreenSelectionProps {
  onSelectionComplete?: (selection: { x: number, y: number, width: number, height: number }) => void;
}

const ScreenSelection: React.FC<ScreenSelectionProps> = ({ onSelectionComplete }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const { toast } = useToast();

  const startSelection = () => {
    setIsSelecting(true);
    toast({
      title: "Screen Selection",
      description: "Drag to select area of screen for AI processing",
    });
    
    // Simulating selection for now
    setTimeout(() => {
      setIsSelecting(false);
      if (onSelectionComplete) {
        onSelectionComplete({ x: 0, y: 0, width: 300, height: 200 });
      }
      
      toast({
        title: "Selection Complete",
        description: "Processing selected area...",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-dashed border-todo-purple/30 rounded-xl">
        <div className="text-center space-y-4">
          <Crop className="mx-auto h-12 w-12 text-todo-purple" />
          
          <div>
            <h3 className="font-medium">Screen Selection Tool</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select any area of your screen for AI processing without taking a screenshot
            </p>
          </div>
          
          <Button 
            onClick={startSelection}
            disabled={isSelecting}
            className="bg-todo-purple text-white"
          >
            {isSelecting ? "Selecting..." : "Start Selection"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreenSelection;
