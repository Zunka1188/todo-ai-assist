
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import ScreenSelection from '@/components/features/scanning/ScreenSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showScreenSelection, setShowScreenSelection] = useState(false);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();

  // Get return destination from session storage if available
  const returnDestination = sessionStorage.getItem('returnToAfterScan');

  const goBack = () => {
    if (showScreenSelection) {
      setShowScreenSelection(false);
    } else if (returnDestination) {
      // Clear the session storage
      sessionStorage.removeItem('returnToAfterScan');
      sessionStorage.removeItem('scanAction');
      // Navigate to the return destination
      navigate(`/${returnDestination}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label={returnDestination ? `Go back to ${returnDestination}` : "Go back to home"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={showScreenSelection ? "Screen Selection" : "Scan"} 
          className="py-0"
        />
      </div>
      
      <div className="flex-1">
        {showScreenSelection ? (
          <ScreenSelection onClose={() => setShowScreenSelection(false)} />
        ) : (
          <ScanningOptions 
            onScreenSelectionClick={() => setShowScreenSelection(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ScanPage;
