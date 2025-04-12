
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DataRecoveryHandlerProps {
  errorMessage?: string;
}

export const DataRecoveryHandler: React.FC<DataRecoveryHandlerProps> = ({ 
  errorMessage = "We couldn't load your shopping list. Please try refreshing the page."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-center text-muted-foreground max-w-md">{errorMessage}</p>
      <Button 
        variant="default"
        onClick={() => window.location.reload()}
        className="mt-4"
      >
        Refresh Page
      </Button>
    </div>
  );
};
