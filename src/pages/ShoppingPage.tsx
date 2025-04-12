
import React from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { DataRecoveryHandler } from '@/components/features/shopping/DataRecoveryHandler';
import { logger } from '@/utils/logger';
import { TOAST_DURATIONS } from '@/utils/errorHandling';
import { useDataRecovery } from '@/hooks/useDataRecovery';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { usePersistenceSetup } from '@/hooks/usePersistenceSetup';

/**
 * ShoppingPage component
 * Manages shopping list with cross-browser synchronization and mobile persistence
 */
const ShoppingPage: React.FC = () => {
  // Set up data recovery and persistence with custom hooks
  const { isRecovering } = useDataRecovery();
  useVisibilityChange();
  usePersistenceSetup();

  return (
    <ErrorBoundary 
      fallback={<DataRecoveryHandler isLoading={isRecovering} />}
    >
      <ShoppingItemsProvider>
        <ShoppingPageContent />
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
