
import React, { useEffect } from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { setupCrossBrowserSync } from '@/services/shoppingService';

// Add mobile browser persistence enhancement
import { setupMobilePersistence } from '@/services/shoppingService';
import { useIsMobile } from '@/hooks/use-mobile';

const ShoppingPage: React.FC = () => {
  const { isMobile } = useIsMobile();

  // Setup cross-browser sync and mobile persistence on component mount
  useEffect(() => {
    const cleanupBrowserSync = setupCrossBrowserSync();
    
    // Setup mobile-specific persistence if on mobile
    let cleanupMobilePersistence: (() => void) | undefined;
    
    if (isMobile) {
      cleanupMobilePersistence = setupMobilePersistence();
      console.log('[ShoppingPage] Mobile persistence setup complete');
    }
    
    // Cleanup function for both
    return () => {
      cleanupBrowserSync();
      if (cleanupMobilePersistence) cleanupMobilePersistence();
    };
  }, [isMobile]);

  return (
    <ErrorBoundary>
      <ShoppingItemsProvider>
        <ShoppingPageContent />
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
