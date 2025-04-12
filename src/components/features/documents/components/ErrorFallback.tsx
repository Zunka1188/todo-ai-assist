
import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error | string | null;
  resetError?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  description,
  showHomeButton = true,
  showReloadButton = true,
}) => {
  const navigate = useNavigate();
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="flex justify-center items-center h-full min-h-[300px] w-full">
      <div className="text-center p-6 max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">
          {description || errorMessage || "We couldn't load your documents. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showReloadButton && (
            <Button 
              variant="outline" 
              onClick={() => resetError ? resetError() : window.location.reload()}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          )}
          
          {showHomeButton && (
            <Button 
              variant="default" 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to homepage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
