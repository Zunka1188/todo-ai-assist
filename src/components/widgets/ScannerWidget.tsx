
import React from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WidgetWrapper } from './shared/WidgetWrapper';

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
          Scan documents, receipts and more
        </p>
        <Button 
          onClick={() => navigate('/scan')}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Open Scanner
        </Button>
      </div>
    </WidgetWrapper>
  );
};

export default ScannerWidget;
