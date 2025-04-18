
import React, { useState } from 'react';
import { Brain, Camera, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import AIScanIntegration from '../features/ai/AIScanIntegration';
import { cn } from '@/lib/utils';
import AIFoodAssistant from '../features/ai/AIFoodAssistant';

export interface AIScanWidgetProps {
  className?: string;
}

const AIAssistantWidget = ({ className }: AIScanWidgetProps) => {
  const navigate = useNavigate();
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const handleOpenAssistant = () => {
    setAssistantOpen(true);
  };

  return (
    <WidgetWrapper
      className={cn("bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/30", 
        className
      )}
      title="AI Assistant"
      icon={<Brain className="h-4 w-4 text-purple-500" />}
    >
      <div className="flex flex-col space-y-3 p-1">
        <p className="text-xs text-muted-foreground">
          Use AI to scan products, get recipe ideas, and manage your shopping list.
        </p>

        <div className="flex gap-2 mt-2">
          <AIScanIntegration />
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/upload')}
            className="text-sm"
            size="sm"
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
          
          <Button
            variant="default"
            onClick={handleOpenAssistant}
            className="text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            size="sm"
          >
            <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
            Food
          </Button>
        </div>
      </div>
      
      <AIFoodAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setAssistantOpen(false)} 
      />
    </WidgetWrapper>
  );
};

export default AIAssistantWidget;
