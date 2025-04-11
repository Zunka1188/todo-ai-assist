
import React, { useEffect } from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { setupCrossBrowserSync, enhancedMobileSave, saveItems, loadItems, setupMobilePersistence, checkAndRestoreBackup } from '@/services/shoppingService';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const ShoppingPage: React.FC = () => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();

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
            
            toast({
              title: "Data Restored",
              description: `Successfully restored ${restoredItems.length} shopping items from backup.`,
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('[ShoppingPage] Error restoring mobile data:', error);
        toast({
          title: "Data Restore Error",
          description: "There was an issue restoring your shopping list. Please try refreshing the page.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
    
    // Cleanup function for both
    return () => {
      cleanupBrowserSync();
      if (cleanupMobilePersistence) cleanupMobilePersistence();
    };
  }, [isMobile, toast]);

  // Double-check localStorage every time the page gains focus (especially important on mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMobile) {
        try {
          const items = loadItems();
          console.log('[ShoppingPage] Visibility changed to visible, checking items:', items?.length || 0);
          
          // If we lost items somehow, try to restore from backup
          if (!items || items.length === 0) {
            const backupItems = checkAndRestoreBackup();
            if (backupItems && backupItems.length > 0) {
              enhancedMobileSave(backupItems);
              console.log('[ShoppingPage] Restored from backup on visibility change:', backupItems.length);
              
              toast({
                title: "Data Restored",
                description: "Your shopping list has been restored from backup.",
                duration: 3000,
              });
            }
          }
        } catch (error) {
          console.error('[ShoppingPage] Error during visibility change check:', error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMobile, toast]);

  return (
    <ErrorBoundary fallback={
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
        <p className="mb-4">We couldn't load your shopping list. Please try refreshing the page.</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    }>
      <ShoppingItemsProvider>
        <ShoppingPageContent />
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
