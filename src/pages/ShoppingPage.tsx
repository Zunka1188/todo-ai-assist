
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { DataRecoveryHandler } from '@/components/features/shopping/DataRecoveryHandler';
import { logger } from '@/utils/logger';
import { useDataRecovery } from '@/hooks/useDataRecovery';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { usePersistenceSetup } from '@/hooks/usePersistenceSetup';

/**
 * ShoppingPage component
 * Manages shopping list with cross-browser synchronization and mobile persistence
 */
const ShoppingPage: React.FC = () => {
  // Set up data recovery and persistence with custom hooks
  // Define the error state manually since it's not provided by useDataRecovery
  const { isRecovering, retryRecovery } = useDataRecovery();
  useVisibilityChange();
  usePersistenceSetup();

  // Define an error state variable
  const [error, setError] = React.useState<string | null>(null);

  return (
    <ErrorBoundary 
      fallback={<DataRecoveryHandler isLoading={isRecovering} />}
      onError={(error: Error, errorInfo) => logger.error('[ShoppingPage] Error boundary caught error:', error, errorInfo)}
    >
      <AppPage
        title="Shopping List"
        icon={<ShoppingBag className="h-5 w-5" />}
        subtitle="Manage your shopping items"
        isLoading={isRecovering}
        error={error}
        fullHeight
      >
        <ShoppingItemsProvider>
          <ShoppingPageContent />
        </ShoppingItemsProvider>
      </AppPage>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
