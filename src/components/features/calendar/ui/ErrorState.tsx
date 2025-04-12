
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry = () => window.location.reload() 
}) => {
  return (
    <PageLayout maxWidth="full" className="flex flex-col h-[calc(100vh-4rem)]" noPadding>
      <div 
        className="flex flex-col items-center justify-center h-full p-4"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-center">{error}</p>
        <Button onClick={onRetry}>
          Reload Page
        </Button>
      </div>
    </PageLayout>
  );
};

export default ErrorState;
