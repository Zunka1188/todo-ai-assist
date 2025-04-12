
import React from 'react';
import { Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading calendar..." 
}) => {
  return (
    <PageLayout maxWidth="full" className="flex flex-col h-[calc(100vh-4rem)]" noPadding>
      <div 
        className="flex flex-col items-center justify-center h-full"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </PageLayout>
  );
};

export default LoadingState;
