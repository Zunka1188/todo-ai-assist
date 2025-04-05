
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ModelUpdateManager from '@/components/features/ai/ModelUpdateManager';

const AIModelsPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="AI Detection Models" 
          subtitle="Manage and update the AI models used for detection"
          className="py-0"
        />
      </div>
      
      <ModelUpdateManager />
    </div>
  );
};

export default AIModelsPage;
