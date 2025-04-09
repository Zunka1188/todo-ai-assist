
import React from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';

const ShoppingPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ShoppingItemsProvider>
        <div className="px-4 md:px-4">
          <ShoppingPageContent />
        </div>
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
