import React, { useEffect } from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { setupCrossBrowserSync, enhancedMobileSave, saveItems, loadItems, setupMobilePersistence, checkAndRestoreBackup } from '@/services/shoppingService';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';  // Add this import for the cn utility function

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
        // First try to load from localStorage
        const items = loadItems();
        if (items && items.length > 0) {
          // Ensure data is properly saved
          enhancedMobileSave(items);
          console.log('[ShoppingPage] Mobile data restored and saved:', items.length, 'items');
        } else {
          // If localStorage is empty, try to restore from backup
          const restoredItems = checkAndRestoreBackup();
          if (restoredItems && restoredItems.length > 0) {
            enhancedMobileSave(restoredItems);
            console.log('[ShoppingPage] Mobile data restored from backup:', restoredItems.length, 'items');
          }
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

  // Double-check localStorage every time the page gains focus (especially important on mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMobile) {
        const items = loadItems();
        console.log('[ShoppingPage] Visibility changed to visible, checking items:', items?.length || 0);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
