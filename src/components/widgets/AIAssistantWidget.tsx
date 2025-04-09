
import React from 'react';
import { Brain, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import AIScanIntegration from '../features/ai/AIScanIntegration';
import { cn } from '@/lib/utils';

export interface AIScanWidgetProps {
  className?: string;
}

const AIAssistantWidget = ({ className }: AIScanWidgetProps) => {
  const navigate = useNavigate();

  return (
    <WidgetWrapper
      title="AI Assistant"
      icon={<Brain className="text-purple-500" />}
      className={cn("bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/30", 
        className
      )}
    >
      <div className="flex flex-col space-y-3 p-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium flex items-center">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            Smart Detection
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Use AI to scan and detect products, documents, and events automatically.
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
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default AIAssistantWidget;
