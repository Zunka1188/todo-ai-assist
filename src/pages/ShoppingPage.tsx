
import React, { useState, useCallback, useEffect } from 'react';
import { ShoppingBag, AlertTriangle } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ShoppingErrorBoundary from '@/components/features/shopping/ShoppingErrorBoundary';
import { logger } from '@/utils/logger';
import { useDataRecovery } from '@/hooks/useDataRecovery';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { usePersistenceSetup } from '@/hooks/usePersistenceSetup';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { TOAST_DURATIONS } from '@/utils/errorHandling';

/**
 * Interface for ShoppingPage props
 * Currently no props required but defined for future extensibility
 */
interface ShoppingPageProps {}

/**
 * Error severity levels for categorization
 */
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * ShoppingPage component
 * Manages shopping list with cross-browser synchronization and mobile persistence
 */
const ShoppingPage: React.FC<ShoppingPageProps> = () => {
  // Set up data recovery and persistence with custom hooks
  const { isRecovering, retryRecovery } = useDataRecovery();
  const { toast } = useToast();
  
  // Custom hook usage for persistence and visibility change detection
  useVisibilityChange();
  usePersistenceSetup();

  // Manage error state locally with severity tracking
  const [error, setError] = useState<string | null>(null);
  const [errorSeverity, setErrorSeverity] = useState<ErrorSeverity>('medium');
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRY_ATTEMPTS = 3;
  
  // Add loading state for UI feedback during operations
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  
  // Clear error after a timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, errorSeverity === 'critical' ? 0 : TOAST_DURATIONS.MEDIUM);
      
      return () => clearTimeout(timer);
    }
  }, [error, errorSeverity]);
  
  // Handler for retry actions with rate limiting
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      toast({
        title: "Retry limit reached",
        description: "Please try again later or refresh the page",
        duration: TOAST_DURATIONS.MEDIUM,
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setIsLoadingData(true);
    setRetryCount(prev => prev + 1);
    
    logger.log('[ShoppingPage] Retry recovery initiated', { attempt: retryCount + 1 });
    
    // Add exponential backoff for retries
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    
    setTimeout(() => {
      retryRecovery()
        .finally(() => {
          setIsLoadingData(false);
        });
    }, backoffDelay);
  }, [retryCount, retryRecovery, toast]);
  
  // Reset retry count after successful operation
  useEffect(() => {
    if (!error && !isLoadingData && retryCount > 0) {
      setRetryCount(0);
    }
  }, [error, isLoadingData, retryCount]);
  
  // Enhanced error handler with severity categorization
  const handleError = useCallback((err: Error | string) => {
    // Validate and sanitize error message
    const rawMessage = typeof err === 'string' ? err : err.message || 'Something went wrong';
    const errorMessage = rawMessage.substring(0, 500); // Limit length for security
    
    // Categorize error severity based on content
    let severity: ErrorSeverity = 'medium';
    if (rawMessage.includes('network') || rawMessage.includes('timeout')) {
      severity = 'low';
    } else if (rawMessage.includes('permission') || rawMessage.includes('access')) {
      severity = 'high';
    } else if (rawMessage.includes('data loss') || rawMessage.includes('corrupt')) {
      severity = 'critical';
    }
    
    setErrorSeverity(severity);
    setError(errorMessage);
    logger.error('[ShoppingPage] Error in shopping items context:', { 
      message: errorMessage,
      severity,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Loading skeleton for better user experience during data loading
  const LoadingSkeleton = () => (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );

  const isLoading = isRecovering || isLoadingData;

  return (
    <AppPage
      title="Shopping List"
      icon={<ShoppingBag className="h-5 w-5" />}
      subtitle="Manage your shopping items"
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      fullHeight
    >
      <ShoppingErrorBoundary
        fallbackUI={
          <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4 text-center">
              We encountered an error while loading your shopping items.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        }
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <ShoppingItemsProvider onError={handleError}>
            <ShoppingPageContent />
          </ShoppingItemsProvider>
        )}
      </ShoppingErrorBoundary>
    </AppPage>
  );
};

export default ShoppingPage;
