
import React from 'react';
import { Scan, Camera, Sparkles, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';

const ScannerWidget = () => {
  const navigate = useNavigate();
  const { status } = useModelUpdates();
  
  // Check if any model has updates available
  const hasUpdates = Object.values(status.updatesAvailable).some(Boolean);
  
  const handleSmartScan = () => {
    sessionStorage.setItem('preferredScanMode', 'smart');
    navigate('/scan');
  };
  
  const handleBarcodeScan = () => {
    sessionStorage.setItem('preferredScanMode', 'barcode');
    navigate('/scan');
  };
  
  return (
    <WidgetWrapper>
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center">
          <div className="bg-primary bg-opacity-10 p-4 rounded-full">
            <Scan className="h-6 w-6 text-primary" />
          </div>
          
          {hasUpdates && (
            <span className="h-3 w-3 bg-primary rounded-full animate-pulse -mt-3 -ml-2" />
          )}
        </div>
        <h3 className="font-medium text-lg">Smart Scanner</h3>
        <p className="text-sm text-muted-foreground text-center">
          Scan products, barcodes, documents, and more with AI
        </p>
        <div className="space-y-2 w-full">
          <Button 
            onClick={handleSmartScan}
            className="w-full bg-primary hover:bg-primary/90 flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Smart Scan
          </Button>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/ai-models')}
                    className="border-dashed border-primary/30 flex items-center"
                    style={{ flex: '0 0 auto', width: 'auto' }}
                  >
                    <Settings className="h-4 w-4" />
                    {hasUpdates && <span className="h-2 w-2 bg-primary rounded-full ml-1" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasUpdates ? 'AI model updates available!' : 'Manage AI detection models'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={handleBarcodeScan}
                    className="flex-1 border-dashed border-primary/30 flex items-center"
                  >
                    <Scan className="h-4 w-4 mr-2 text-primary" />
                    Barcode Scanner
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scan product barcodes for quick recognition</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default ScannerWidget;
