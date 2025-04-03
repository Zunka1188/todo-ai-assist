
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const ScanPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const goBack = () => {
    navigate('/');
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
          title="Smart Scanner" 
          subtitle="Automatically recognize items and take action"
          className="py-0"
        />
      </div>
      <ScanningOptions />
    </div>
  );
};

export default ScanPage;
