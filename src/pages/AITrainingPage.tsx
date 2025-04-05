
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import AIModelTraining from '@/components/features/ai/AIModelTraining';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModelUpdateManager from '@/components/features/ai/ModelUpdateManager';

const AITrainingPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 space-y-6 py-4">
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
          title="AI Model Training" 
          subtitle="Training data and model performance metrics"
          className="py-0"
        />
      </div>
      
      <Tabs defaultValue="training">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="training">Training & Metrics</TabsTrigger>
          <TabsTrigger value="models">Model Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="training">
          <AIModelTraining />
        </TabsContent>
        
        <TabsContent value="models">
          <ModelUpdateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITrainingPage;
