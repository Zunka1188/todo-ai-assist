
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
    }
  };

  // Save before app closes/refreshes
  const handleBeforeUnload = () => {
    const items = loadItems();
    if (items.length > 0) {
      saveItems(items);
      console.log("[DEBUG] Force synced items before unload");
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
  
  // Fallback with delay (helps with mobile browsers)
  setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[ERROR] Enhanced save fallback failed:', error);
    }
  }, 100);
  
  return result;
};
