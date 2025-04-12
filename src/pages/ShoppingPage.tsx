import React, { useState, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import { logger } from '@/utils/logger';
import { useDataRecovery } from '@/hooks/useDataRecovery';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { usePersistenceSetup } from '@/hooks/usePersistenceSetup';
import ErrorBoundary from '@/components/ui/error-boundary';

/**
 * ShoppingPage component
 * Manages shopping list with cross-browser synchronization and mobile persistence
 */
const ShoppingPage: React.FC = () => {
  // Set up data recovery and persistence with custom hooks
  const { isRecovering, retryRecovery } = useDataRecovery();
  useVisibilityChange();
  usePersistenceSetup();

  // Manage error state locally
  const [error, setError] = useState<string | null>(null);
  
  // Handler for retry actions
  const handleRetry = useCallback(() => {
    setError(null);
    retryRecovery();
    logger.log('[ShoppingPage] Retry recovery initiated');
  }, [retryRecovery]);
  
  // Handler for errors coming from ShoppingItemsContext
  const handleError = useCallback((err: Error | string) => {
    const errorMessage = typeof err === 'string' ? err : err.message || 'Something went wrong';
    setError(errorMessage);
    logger.error('[ShoppingPage] Error in shopping items context:', errorMessage);
  }, []);

  return (
    <ErrorBoundary context="ShoppingPage">
      <AppPage
        title="Shopping List"
        icon={<ShoppingBag className="h-5 w-5" />}
        subtitle="Manage your shopping items"
        isLoading={isRecovering}
        error={error}
        onRetry={handleRetry}
        fullHeight
      >
        <ShoppingItemsProvider onError={handleError}>
          <ShoppingPageContent />
        </ShoppingItemsProvider>
      </AppPage>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
