
import React from 'react';
import { Scan, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ScannerWidget = () => {
  const navigate = useNavigate();
  
  return (
    <WidgetWrapper>
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="bg-primary bg-opacity-10 p-4 rounded-full">
          <Scan className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-medium text-lg">Smart Scanner</h3>
        <p className="text-sm text-muted-foreground text-center">
          Scan documents, receipts, products and more with AI
        </p>
        <div className="space-y-2 w-full">
          <Button 
            onClick={() => navigate('/scan')}
            className="w-full bg-primary hover:bg-primary/90 flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Open Scanner
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/upload')}
                  className="w-full border-dashed border-primary/30 flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Advanced AI Detection
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Detect barcodes, products, documents, and more with AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default ScannerWidget;
