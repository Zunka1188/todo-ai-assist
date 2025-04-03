
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import ScreenSelection from '@/components/features/scanning/ScreenSelection';
import { useIsMobile } from '@/hooks/use-mobile';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showScreenSelection, setShowScreenSelection] = useState(false);
  const isMobile = useIsMobile();

  const goBack = () => {
    if (showScreenSelection) {
      setShowScreenSelection(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 py-1 sm:py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2 min-h-[44px] min-w-[44px]"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={showScreenSelection ? "Screen Selection" : "Smart Scanner"} 
          subtitle={showScreenSelection 
            ? "Select any part of the screen for processing" 
            : isMobile 
              ? "Scan and analyze items" 
              : "Automatically recognize items and take action"
          }
          className="py-0"
        />
      </div>
      
      {showScreenSelection ? (
        <ScreenSelection onClose={() => setShowScreenSelection(false)} />
      ) : (
        <ScanningOptions 
          onScreenSelectionClick={() => setShowScreenSelection(true)} 
        />
      )}
    </div>
  );
};

export default ScanPage;
