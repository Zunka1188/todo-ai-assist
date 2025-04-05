
import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ModelUpdateManager from '@/components/features/ai/ModelUpdateManager';

const AIModelsPage = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/settings');
  };

  return (
    <div className="space-y-3 sm:space-y-6 py-1 sm:py-4 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2 min-h-[44px] min-w-[44px]"
          aria-label="Go back to settings"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="AI Models & Detection" 
          subtitle="Manage AI models and detection settings"
          className="py-0"
          icon={<Settings className="h-5 w-5" />}
        />
      </div>

      <div className="flex-1 container max-w-4xl mx-auto px-4">
        <ModelUpdateManager onClose={goBack} />
      </div>
    </div>
  );
};

export default AIModelsPage;
