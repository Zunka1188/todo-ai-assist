
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import ScreenSelection from '@/components/features/scanning/ScreenSelection';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showScreenSelection, setShowScreenSelection] = useState(false);

  const goBack = () => {
    if (showScreenSelection) {
      setShowScreenSelection(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="space-y-4 py-2 sm:space-y-6 sm:py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={showScreenSelection ? "Screen Selection" : "Smart Scanner"} 
          subtitle={showScreenSelection 
            ? "Select any part of the screen for processing" 
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
