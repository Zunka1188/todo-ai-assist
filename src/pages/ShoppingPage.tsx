
import React, { useEffect } from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { setupCrossBrowserSync, enhancedMobileSave, saveItems, loadItems } from '@/services/shoppingService';

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
      
      // Force restore from localStorage on mobile to ensure data is available after refreshes
      try {
        const items = loadItems();
        if (items && items.length > 0) {
          // Ensure data is properly saved
          enhancedMobileSave(items);
          console.log('[ShoppingPage] Mobile data restored and saved:', items.length, 'items');
        }
      } catch (error) {
        console.error('[ShoppingPage] Error restoring mobile data:', error);
      }
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
