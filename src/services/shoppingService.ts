
/**
 * Shopping service utilities to help with mobile/desktop synchronization
 */

import { ShoppingItem } from '@/components/features/shopping/useShoppingItems';

// Constants for storage keys
export const STORAGE_KEY = 'shoppingItems';
export const LAST_SYNC_KEY = 'shoppingLastSync';

/**
 * Load items from storage with error handling
 */
export const loadItems = (): ShoppingItem[] => {
  try {
    const items = localStorage.getItem(STORAGE_KEY);
    if (!items) return [];

    const parsedItems = JSON.parse(items);
    
    // Convert date strings back to Date objects
    return parsedItems.map((item: any) => ({
      ...item,
      dateAdded: new Date(item.dateAdded),
      lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
    }));
  } catch (error) {
    console.error("[ERROR] Failed to load items from storage:", error);
    return [];
  }
};

/**
 * Save items to storage with error handling
 */
export const saveItems = (items: ShoppingItem[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    
    // Force critical data sync for added reliability
    try {
      // Create and dispatch a storage event to notify other tabs
      if (typeof window !== 'undefined') {
        const storageEvent = new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(items),
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
      }
    } catch (e) {
      console.error("[ERROR] Failed to dispatch storage event:", e);
    }
    
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to save items to storage:", error);
    return false;
  }
};

/**
 * Mobile-specific persistence helpers
 */
export const setupMobilePersistence = () => {
  // Save on page visibility change (user switches apps)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Force sync when app goes to background
      const items = loadItems();
      if (items.length > 0) {
        saveItems(items);
        console.log("[DEBUG] Force synced items on visibility change");
      }
    } else if (document.visibilityState === 'visible') {
      // Also reload when coming back to the app
      const items = loadItems();
      if (items && items.length > 0) {
        // Dispatch a storage event to update any components listening
        const storageEvent = new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(items),
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
        console.log("[DEBUG] Reloaded items when app returned to foreground");
      }
    }
  };

  // Save before app closes/refreshes
  const handleBeforeUnload = () => {
    const items = loadItems();
    if (items.length > 0) {
      saveItems(items);
      console.log("[DEBUG] Force synced items before unload");
      
      // Create a backup copy in sessionStorage for extra reliability
      try {
        sessionStorage.setItem('shoppingItems_backup', JSON.stringify(items));
      } catch (e) {
        console.error("[ERROR] Failed to create backup in sessionStorage:", e);
      }
    }
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

/**
 * Setup cross-browser synchronization
 * This is intended to help sync between tabs
 */
export const setupCrossBrowserSync = () => {
  // Listen for storage events from other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      console.log("[DEBUG] Detected shopping list change in another tab");
      // Processing could be done here in the future
    }
  };

  // Add event listener
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Mobile-specific save enhancement to help with browser storage limits
 * and ensure data is saved even when the app is in the background
 */
export const enhancedMobileSave = (items: ShoppingItem[]): boolean => {
  // First try - normal save
  const result = saveItems(items);
  
  // Fallback with multiple save attempts (helps with mobile browsers)
  setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      console.log("[DEBUG] Mobile fallback save 1 completed");
      
      // Also save to sessionStorage as an additional backup
      sessionStorage.setItem('shoppingItems_backup', JSON.stringify(items));
    } catch (error) {
      console.error('[ERROR] Enhanced save fallback 1 failed:', error);
    }
  }, 100);
  
  // Second fallback after longer delay
  setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      console.log("[DEBUG] Mobile fallback save 2 completed");
    } catch (error) {
      console.error('[ERROR] Enhanced save fallback 2 failed:', error);
    }
  }, 500);
  
  // Third fallback after even longer delay
  setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      console.log("[DEBUG] Mobile fallback save 3 completed");
    } catch (error) {
      console.error('[ERROR] Enhanced save fallback 3 failed:', error);
    }
  }, 1500);
  
  return result;
};

/**
 * Function to check if there's a backup and restore it if needed
 */
export const checkAndRestoreBackup = (): ShoppingItem[] | null => {
  try {
    // First check localStorage
    const items = loadItems();
    if (items && items.length > 0) {
      return items;
    }
    
    // If nothing in localStorage, try the backup
    const backup = sessionStorage.getItem('shoppingItems_backup');
    if (backup) {
      const parsedBackup = JSON.parse(backup);
      if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
        // Restore the backup
        saveItems(parsedBackup.map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded),
          lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
        })));
        console.log("[DEBUG] Restored shopping items from backup");
        return parsedBackup;
      }
    }
    return null;
  } catch (error) {
    console.error("[ERROR] Failed to check or restore backup:", error);
    return null;
  }
};
