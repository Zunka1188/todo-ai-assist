
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

/**
 * Hook for standardized error handling across the application
 * Provides consistent error logging and user feedback
 */
const useErrorHandler = () => {
  const handleError = useCallback((errorMessage: string, context?: string) => {
    // Log the error
    if (context) {
      logger.error(`[${context}] ${errorMessage}`);
    } else {
      logger.error(errorMessage);
    }
    
    // Display toast notification to user
    toast({
      title: "An error occurred",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  }, []);

  return { handleError };
};

export default useErrorHandler;
